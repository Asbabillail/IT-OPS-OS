import "server-only";

import type {
  RepairId,
  ReturnId,
  ReturnRecord,
  StudentId,
} from "@/data/domain/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type ReturnRow = {
  id: string;
  return_code: string;
  assignment_id: string;
  return_status: "Received" | "Inspection Required";
  condition: "Good" | "Screen Damage";
  accessories: "Complete" | "Missing Charger";
  outcome: "Ready for Release" | "Repair Required";
  initiated_date: string;
  received_date: string;
  inspected_date: string | null;
  inspection_notes: string;
  repair_id: string | null;
};

type AssignmentRow = {
  id: string;
  student_id: string;
  device_id: string;
};

type StudentRow = {
  id: string;
  student_code: string;
  name: string;
};

type DeviceRow = {
  id: string;
  serial: string;
  asset_tag: string;
};

export type ReturnDirectoryRow = {
  record: ReturnRecord;
  studentName: string;
  assetTag: string;
};

function toReturnId(value: string): ReturnId {
  if (!value.startsWith("RET-")) {
    throw new Error(`Invalid return_code returned from database: ${value}`);
  }

  return value as ReturnId;
}

function toStudentId(value: string): StudentId {
  if (!value.startsWith("STU-")) {
    throw new Error(`Invalid student_code returned from database: ${value}`);
  }

  return value as StudentId;
}

function toRepairId(value: string | null): RepairId | null {
  if (value === null) {
    return null;
  }

  if (!value.startsWith("REP-")) {
    throw new Error(`Invalid repair_id returned from database: ${value}`);
  }

  return value as RepairId;
}

export async function listReturnDirectory(): Promise<ReturnDirectoryRow[]> {
  const supabase = getSupabaseServerClient();

  const { data: returnData, error: returnError } = await supabase
    .from("returns")
    .select(
      "id,return_code,assignment_id,return_status,condition,accessories,outcome,initiated_date,received_date,inspected_date,inspection_notes,repair_id",
    )
    .order("received_date", { ascending: false });

  if (returnError) {
    throw new Error(`Failed to load returns: ${returnError.message}`, {
      cause: returnError,
    });
  }

  const returnRows = returnData as ReturnRow[];

  if (returnRows.length === 0) {
    return [];
  }

  const assignmentIds = [
    ...new Set(returnRows.map((row) => row.assignment_id)),
  ];

  const { data: assignmentData, error: assignmentError } = await supabase
    .from("device_assignments")
    .select("id,student_id,device_id")
    .in("id", assignmentIds);

  if (assignmentError) {
    throw new Error(
      `Failed to load return assignments: ${assignmentError.message}`,
      { cause: assignmentError },
    );
  }

  const assignments = assignmentData as AssignmentRow[];

  const studentIds = [
    ...new Set(assignments.map((assignment) => assignment.student_id)),
  ];

  const deviceIds = [
    ...new Set(assignments.map((assignment) => assignment.device_id)),
  ];

  const [
    { data: studentData, error: studentError },
    { data: deviceData, error: deviceError },
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id,student_code,name")
      .in("id", studentIds),
    supabase
      .from("devices")
      .select("id,serial,asset_tag")
      .in("id", deviceIds),
  ]);

  if (studentError) {
    throw new Error(
      `Failed to resolve return students: ${studentError.message}`,
      { cause: studentError },
    );
  }

  if (deviceError) {
    throw new Error(
      `Failed to resolve returned devices: ${deviceError.message}`,
      { cause: deviceError },
    );
  }

  const assignmentById = new Map(
    assignments.map((assignment) => [assignment.id, assignment]),
  );

  const studentById = new Map(
    (studentData as StudentRow[]).map((student) => [student.id, student]),
  );

  const deviceById = new Map(
    (deviceData as DeviceRow[]).map((device) => [device.id, device]),
  );

  return returnRows.map((row) => {
    const assignment = assignmentById.get(row.assignment_id);

    if (!assignment) {
      throw new Error(
        `Return ${row.return_code} references an unresolved assignment`,
      );
    }

    const student = studentById.get(assignment.student_id);

    if (!student) {
      throw new Error(
        `Return ${row.return_code} references an unresolved student`,
      );
    }

    const device = deviceById.get(assignment.device_id);

    if (!device) {
      throw new Error(
        `Return ${row.return_code} references an unresolved device`,
      );
    }

    return {
      record: {
        id: toReturnId(row.return_code),
        studentId: toStudentId(student.student_code),
        deviceSerial: device.serial,
        returnStatus: row.return_status,
        condition: row.condition,
        accessories: row.accessories,
        outcome: row.outcome,
        initiatedDate: row.initiated_date,
        receivedDate: row.received_date,
        inspectedDate: row.inspected_date,
        assignmentClosedDate: null,
        inspectionNotes: row.inspection_notes,
        repairId: toRepairId(row.repair_id),
      },
      studentName: student.name,
      assetTag: device.asset_tag,
    };
  });
}

export async function getReturnById(
  returnId: string,
): Promise<ReturnRecord | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("returns")
    .select(
      "id,return_code,assignment_id,return_status,condition,accessories,outcome,initiated_date,received_date,inspected_date,inspection_notes,repair_id",
    )
    .eq("return_code", returnId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to load return: ${error.message}`, {
      cause: error,
    });
  }

  const row = data as ReturnRow;

  const { data: assignmentData } = await supabase
    .from("device_assignments")
    .select("student_id,device_id")
    .eq("id", row.assignment_id)
    .single();

  if (!assignmentData) {
    return null;
  }

  const assignment = assignmentData as AssignmentRow;

  const [
    { data: studentData },
    { data: deviceData },
  ] = await Promise.all([
    supabase
      .from("students")
      .select("student_code")
      .eq("id", assignment.student_id)
      .single(),
    supabase
      .from("devices")
      .select("serial")
      .eq("id", assignment.device_id)
      .single(),
  ]);

  if (!studentData || !deviceData) {
    return null;
  }

  return {
    id: toReturnId(row.return_code),
    studentId: toStudentId((studentData as { student_code: string }).student_code),
    deviceSerial: (deviceData as { serial: string }).serial,
    returnStatus: row.return_status,
    condition: row.condition,
    accessories: row.accessories,
    outcome: row.outcome,
    initiatedDate: row.initiated_date,
    receivedDate: row.received_date,
    inspectedDate: row.inspected_date,
    assignmentClosedDate: null,
    inspectionNotes: row.inspection_notes,
    repairId: toRepairId(row.repair_id),
  };
}

export async function createReturn(
  studentId: StudentId,
  deviceSerial: string,
): Promise<ReturnRecord> {
  const supabase = getSupabaseServerClient();

  const [
    { data: studentData, error: studentError },
    { data: deviceData, error: deviceError },
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id")
      .eq("student_code", studentId)
      .single(),
    supabase
      .from("devices")
      .select("id")
      .eq("serial", deviceSerial)
      .single(),
  ]);

  if (studentError || deviceError) {
    throw new Error("Student or device not found");
  }

  const student = studentData as { id: string };
  const device = deviceData as { id: string };

  const { data: assignmentData, error: assignmentError } = await supabase
    .from("device_assignments")
    .select("id")
    .eq("student_id", student.id)
    .eq("device_id", device.id)
    .eq("status", "Active")
    .single();

  if (assignmentError) {
    throw new Error("Active assignment not found for this student-device pair");
  }

  const assignment = assignmentData as { id: string };
  const initiatedDate = new Date().toISOString().split("T")[0];

  const { data: returnData, error: returnError } = await supabase
    .from("returns")
    .insert({
      assignment_id: assignment.id,
      return_status: "Received",
      condition: "Good",
      accessories: "Complete",
      outcome: "Ready for Release",
      initiated_date: initiatedDate,
      received_date: initiatedDate,
      inspection_notes: "",
    })
    .select("return_code")
    .single();

  if (returnError) {
    throw new Error(`Failed to create return: ${returnError.message}`);
  }

  const ret = returnData as { return_code: string };

  return {
    id: toReturnId(ret.return_code),
    studentId,
    deviceSerial,
    returnStatus: "Received",
    condition: "Good",
    accessories: "Complete",
    outcome: "Ready for Release",
    initiatedDate,
    receivedDate: initiatedDate,
    inspectedDate: null,
    assignmentClosedDate: null,
    inspectionNotes: "",
    repairId: null,
  };
}

export async function updateReturnStatus(
  returnId: ReturnId,
  returnStatus: string,
  condition?: string,
  accessories?: string,
  outcome?: string,
): Promise<ReturnRecord> {
  const supabase = getSupabaseServerClient();

  const updateData: Record<string, unknown> = { return_status: returnStatus };
  if (condition) updateData.condition = condition;
  if (accessories) updateData.accessories = accessories;
  if (outcome) updateData.outcome = outcome;

  const { data: returnData, error: returnError } = await supabase
    .from("returns")
    .update(updateData)
    .eq("return_code", returnId)
    .select(
      "id,return_code,assignment_id,return_status,condition,accessories,outcome,initiated_date,received_date,inspected_date,inspection_notes,repair_id",
    )
    .single();

  if (returnError) {
    throw new Error(`Failed to update return: ${returnError.message}`);
  }

  const row = returnData as ReturnRow;

  const { data: assignmentData } = await supabase
    .from("device_assignments")
    .select("student_id,device_id")
    .eq("id", row.assignment_id)
    .single();

  const assignment = assignmentData as AssignmentRow;

  const [
    { data: studentData },
    { data: deviceData },
  ] = await Promise.all([
    supabase
      .from("students")
      .select("student_code")
      .eq("id", assignment.student_id)
      .single(),
    supabase
      .from("devices")
      .select("serial")
      .eq("id", assignment.device_id)
      .single(),
  ]);

  const student = studentData as StudentRow;
  const device = deviceData as DeviceRow;

  return {
    id: toReturnId(row.return_code),
    studentId: toStudentId(student.student_code),
    deviceSerial: device.serial,
    returnStatus: row.return_status,
    condition: row.condition,
    accessories: row.accessories,
    outcome: row.outcome,
    initiatedDate: row.initiated_date,
    receivedDate: row.received_date,
    inspectedDate: row.inspected_date,
    assignmentClosedDate: null,
    inspectionNotes: row.inspection_notes,
    repairId: row.repair_id ? toRepairId(row.repair_id) : null,
  };
}
