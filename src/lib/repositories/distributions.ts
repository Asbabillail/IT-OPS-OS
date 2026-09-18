import "server-only";

import type {
  DistributionId,
  DistributionRecord,
  StudentId,
} from "@/data/domain/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type DistributionRow = {
  id: string;
  distribution_code: string;
  assignment_id: string;
  workflow_status: "Verified" | "Pending Signature";
  signature_status: "Verified" | "Awaiting Paper Return";
  handover_date: string;
  paper_returned_date: string | null;
  verified_date: string | null;
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

export type DistributionDirectoryRow = {
  distribution: DistributionRecord;
  studentName: string;
  assetTag: string;
};

function toDistributionId(value: string): DistributionId {
  if (!value.startsWith("DIST-")) {
    throw new Error(
      `Invalid distribution_code returned from database: ${value}`,
    );
  }

  return value as DistributionId;
}

function toStudentId(value: string): StudentId {
  if (!value.startsWith("STU-")) {
    throw new Error(
      `Invalid student_code returned from database: ${value}`,
    );
  }

  return value as StudentId;
}

export async function listDistributionDirectory(): Promise<
  DistributionDirectoryRow[]
> {
  const supabase = getSupabaseServerClient();

  const { data: distributionData, error: distributionError } =
    await supabase
      .from("distributions")
      .select(
        "id,distribution_code,assignment_id,workflow_status,signature_status,handover_date,paper_returned_date,verified_date",
      )
      .order("handover_date", { ascending: false });

  if (distributionError) {
    throw new Error(
      `Failed to load distributions: ${distributionError.message}`,
      { cause: distributionError },
    );
  }

  const distributions = distributionData as DistributionRow[];

  if (distributions.length === 0) {
    return [];
  }

  const assignmentIds = [
    ...new Set(
      distributions.map((distribution) => distribution.assignment_id),
    ),
  ];

  const { data: assignmentData, error: assignmentError } =
    await supabase
      .from("device_assignments")
      .select("id,student_id,device_id")
      .in("id", assignmentIds);

  if (assignmentError) {
    throw new Error(
      `Failed to load distribution assignments: ${assignmentError.message}`,
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
      `Failed to resolve distribution students: ${studentError.message}`,
      { cause: studentError },
    );
  }

  if (deviceError) {
    throw new Error(
      `Failed to resolve distribution devices: ${deviceError.message}`,
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

  return distributions.map((row) => {
    const assignment = assignmentById.get(row.assignment_id);

    if (!assignment) {
      throw new Error(
        `Distribution ${row.distribution_code} references an unresolved assignment`,
      );
    }

    const student = studentById.get(assignment.student_id);

    if (!student) {
      throw new Error(
        `Distribution ${row.distribution_code} references an unresolved student`,
      );
    }

    const device = deviceById.get(assignment.device_id);

    if (!device) {
      throw new Error(
        `Distribution ${row.distribution_code} references an unresolved device`,
      );
    }

    return {
      distribution: {
        id: toDistributionId(row.distribution_code),
        studentId: toStudentId(student.student_code),
        deviceSerial: device.serial,
        status: row.workflow_status,
        signatureStatus: row.signature_status,
        handoverDate: row.handover_date,
        returnedDate: row.paper_returned_date,
        verifiedDate: row.verified_date,
      },
      studentName: student.name,
      assetTag: device.asset_tag,
    };
  });
}

export async function getDistributionById(
  distributionId: string,
): Promise<DistributionRecord | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("distributions")
    .select(
      "id,distribution_code,assignment_id,workflow_status,signature_status,handover_date,paper_returned_date,verified_date",
    )
    .eq("distribution_code", distributionId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to load distribution: ${error.message}`, {
      cause: error,
    });
  }

  const row = data as DistributionRow;

  const { data: assignmentData, error: assignmentError } = await supabase
    .from("device_assignments")
    .select("student_id,device_id")
    .eq("id", row.assignment_id)
    .single();

  if (assignmentError) {
    throw new Error(
      `Failed to load assignment: ${assignmentError.message}`,
      { cause: assignmentError },
    );
  }

  const assignment = assignmentData as AssignmentRow;

  const [
    { data: studentData, error: studentError },
    { data: deviceData, error: deviceError },
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id,student_code")
      .eq("id", assignment.student_id)
      .single(),
    supabase
      .from("devices")
      .select("id,serial")
      .eq("id", assignment.device_id)
      .single(),
  ]);

  if (studentError || deviceError) {
    throw new Error("Failed to resolve distribution references");
  }

  const student = studentData as StudentRow;
  const device = deviceData as DeviceRow;

  return {
    id: toDistributionId(row.distribution_code),
    studentId: toStudentId(student.student_code),
    deviceSerial: device.serial,
    status: row.workflow_status,
    signatureStatus: row.signature_status,
    handoverDate: row.handover_date,
    returnedDate: row.paper_returned_date,
    verifiedDate: row.verified_date,
  };
}
