import "server-only";

import type {
  RepairId,
  RepairRecord,
  StudentId,
} from "@/data/domain/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type RepairRow = {
  id: string;
  repair_code: string;
  device_id: string;
  owner_student_id: string | null;
  issue: string;
  priority: "High" | "Medium" | "Low";
  status: "In Repair" | "Awaiting Parts";
  opened_date: string;
  diagnosis: string;
  service_route: "External Service" | "Internal Repair";
  sent_for_service_date: string;
  completed_date: string | null;
  verified_date: string | null;
};

type DeviceRow = {
  id: string;
  serial: string;
  asset_tag: string;
};

type StudentRow = {
  id: string;
  student_code: string;
};

export type RepairDirectoryRow = {
  repair: RepairRecord;
  assetTag: string;
};

function toRepairId(value: string): RepairId {
  if (!value.startsWith("REP-")) {
    throw new Error(`Invalid repair_code returned from database: ${value}`);
  }

  return value as RepairId;
}

function toStudentId(value: string): StudentId {
  if (!value.startsWith("STU-")) {
    throw new Error(`Invalid student_code returned from database: ${value}`);
  }

  return value as StudentId;
}

export async function listRepairDirectory(): Promise<RepairDirectoryRow[]> {
  const supabase = getSupabaseServerClient();

  const { data: repairData, error: repairError } = await supabase
    .from("repairs")
    .select(
      "id,repair_code,device_id,owner_student_id,issue,priority,status,opened_date,diagnosis,service_route,sent_for_service_date,completed_date,verified_date",
    )
    .order("opened_date", { ascending: false });

  if (repairError) {
    throw new Error(`Failed to load repairs: ${repairError.message}`, {
      cause: repairError,
    });
  }

  const repairRows = repairData as RepairRow[];

  if (repairRows.length === 0) {
    return [];
  }

  const deviceIds = [...new Set(repairRows.map((row) => row.device_id))];

  const studentIds = [
    ...new Set(
      repairRows
        .filter((row) => row.owner_student_id !== null)
        .map((row) => row.owner_student_id as string),
    ),
  ];

  const [deviceResult, studentResult] = await Promise.all([
    supabase.from("devices").select("id,serial,asset_tag").in("id", deviceIds),
    studentIds.length > 0
      ? supabase
          .from("students")
          .select("id,student_code")
          .in("id", studentIds)
      : Promise.resolve({ data: [] as StudentRow[], error: null }),
  ]);

  if (deviceResult.error) {
    throw new Error(
      `Failed to resolve repaired devices: ${deviceResult.error.message}`,
      { cause: deviceResult.error },
    );
  }

  if (studentResult.error) {
    throw new Error(
      `Failed to resolve repair owners: ${studentResult.error.message}`,
      { cause: studentResult.error },
    );
  }

  const deviceById = new Map(
    (deviceResult.data as DeviceRow[]).map((device) => [device.id, device]),
  );

  const studentCodeById = new Map(
    (studentResult.data as StudentRow[]).map((student) => [
      student.id,
      student.student_code,
    ]),
  );

  return repairRows.map((row) => {
    const device = deviceById.get(row.device_id);

    if (!device) {
      throw new Error(
        `Repair ${row.repair_code} references an unresolved device`,
      );
    }

    let ownerStudentId: StudentId | null = null;

    if (row.owner_student_id) {
      const studentCode = studentCodeById.get(row.owner_student_id);

      if (!studentCode) {
        throw new Error(
          `Repair ${row.repair_code} references an unresolved student`,
        );
      }

      ownerStudentId = toStudentId(studentCode);
    }

    return {
      repair: {
        id: toRepairId(row.repair_code),
        deviceSerial: device.serial,
        ownerStudentId,
        issue: row.issue,
        priority: row.priority,
        status: row.status,
        openedDate: row.opened_date,
        diagnosis: row.diagnosis,
        serviceRoute: row.service_route,
        sentForServiceDate: row.sent_for_service_date,
        completedDate: row.completed_date,
        verifiedDate: row.verified_date,
      },
      assetTag: device.asset_tag,
    };
  });
}

export async function getRepairById(
  repairId: string,
): Promise<RepairRecord | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("repairs")
    .select(
      "id,repair_code,device_id,owner_student_id,issue,priority,status,opened_date,diagnosis,service_route,sent_for_service_date,completed_date,verified_date",
    )
    .eq("repair_code", repairId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to load repair: ${error.message}`, {
      cause: error,
    });
  }

  const row = data as RepairRow;

  const { data: deviceData } = await supabase
    .from("devices")
    .select("serial")
    .eq("id", row.device_id)
    .single();

  if (!deviceData) {
    return null;
  }

  let ownerStudentId: StudentId | null = null;

  if (row.owner_student_id) {
    const { data: studentData } = await supabase
      .from("students")
      .select("student_code")
      .eq("id", row.owner_student_id)
      .single();

    if (studentData) {
      ownerStudentId = toStudentId((studentData as { student_code: string }).student_code);
    }
  }

  return {
    id: toRepairId(row.repair_code),
    deviceSerial: (deviceData as { serial: string }).serial,
    ownerStudentId,
    issue: row.issue,
    priority: row.priority,
    status: row.status,
    openedDate: row.opened_date,
    diagnosis: row.diagnosis,
    serviceRoute: row.service_route,
    sentForServiceDate: row.sent_for_service_date,
    completedDate: row.completed_date,
    verifiedDate: row.verified_date,
  };
}

export async function createRepair(
  deviceSerial: string,
  issue: string,
  priority: "High" | "Medium" | "Low",
  ownerStudentId?: StudentId,
): Promise<RepairRecord> {
  const supabase = getSupabaseServerClient();

  const { data: deviceData, error: deviceError } = await supabase
    .from("devices")
    .select("id,serial")
    .eq("serial", deviceSerial)
    .single();

  if (deviceError) {
    throw new Error("Device not found");
  }

  const device = deviceData as DeviceRow;

  let ownerStudentUuid: string | null = null;

  if (ownerStudentId) {
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("id")
      .eq("student_code", ownerStudentId)
      .single();

    if (studentError) {
      throw new Error("Student not found");
    }

    ownerStudentUuid = (studentData as { id: string }).id;
  }

  const openedDate = new Date().toISOString().split("T")[0];

  const { data: repairData, error: repairError } = await supabase
    .from("repairs")
    .insert({
      device_id: device.id,
      owner_student_id: ownerStudentUuid,
      issue,
      priority,
      status: "In Repair",
      opened_date: openedDate,
      diagnosis: null,
      service_route: "Internal Repair",
      sent_for_service_date: openedDate,
      completed_date: null,
      verified_date: null,
    })
    .select("repair_code")
    .single();

  if (repairError) {
    throw new Error(`Failed to create repair: ${repairError.message}`);
  }

  const repair = repairData as { repair_code: string };

  return {
    id: toRepairId(repair.repair_code),
    deviceSerial,
    ownerStudentId: ownerStudentId ?? null,
    issue,
    priority,
    status: "In Repair",
    openedDate,
    diagnosis: "",
    serviceRoute: "Internal Repair",
    sentForServiceDate: openedDate,
    completedDate: null,
    verifiedDate: null,
  };
}

export async function updateRepairStatus(
  repairId: RepairId,
  status: "In Repair" | "Awaiting Parts",
  diagnosis?: string,
): Promise<RepairRecord> {
  const supabase = getSupabaseServerClient();

  const updateData: Record<string, unknown> = { status };
  if (diagnosis) {
    updateData.diagnosis = diagnosis;
  }

  const { data: repairData, error: repairError } = await supabase
    .from("repairs")
    .update(updateData)
    .eq("repair_code", repairId)
    .select(
      "id,repair_code,device_id,owner_student_id,issue,priority,status,opened_date,diagnosis,service_route,sent_for_service_date,completed_date,verified_date",
    )
    .single();

  if (repairError) {
    throw new Error(
      `Failed to update repair: ${repairError.message}`,
      { cause: repairError },
    );
  }

  const row = repairData as RepairRow;

  const { data: deviceData } = await supabase
    .from("devices")
    .select("serial")
    .eq("id", row.device_id)
    .single();

  let ownerStudentId: StudentId | null = null;

  if (row.owner_student_id) {
    const { data: studentData } = await supabase
      .from("students")
      .select("student_code")
      .eq("id", row.owner_student_id)
      .single();

    if (studentData) {
      ownerStudentId = toStudentId((studentData as { student_code: string }).student_code);
    }
  }

  return {
    id: toRepairId(row.repair_code),
    deviceSerial: (deviceData as { serial: string }).serial,
    ownerStudentId,
    issue: row.issue,
    priority: row.priority,
    status: row.status,
    openedDate: row.opened_date,
    diagnosis: row.diagnosis,
    serviceRoute: row.service_route,
    sentForServiceDate: row.sent_for_service_date,
    completedDate: row.completed_date,
    verifiedDate: row.verified_date,
  };
}

export async function markRepairComplete(
  repairId: RepairId,
  completedDate: string,
): Promise<RepairRecord> {
  const supabase = getSupabaseServerClient();

  const { data: repairData, error: repairError } = await supabase
    .from("repairs")
    .update({
      status: "In Repair",
      completed_date: completedDate,
    })
    .eq("repair_code", repairId)
    .select(
      "id,repair_code,device_id,owner_student_id,issue,priority,status,opened_date,diagnosis,service_route,sent_for_service_date,completed_date,verified_date",
    )
    .single();

  if (repairError) {
    throw new Error(
      `Failed to mark repair complete: ${repairError.message}`,
      { cause: repairError },
    );
  }

  const row = repairData as RepairRow;

  const { data: deviceData } = await supabase
    .from("devices")
    .select("serial")
    .eq("id", row.device_id)
    .single();

  let ownerStudentId: StudentId | null = null;

  if (row.owner_student_id) {
    const { data: studentData } = await supabase
      .from("students")
      .select("student_code")
      .eq("id", row.owner_student_id)
      .single();

    if (studentData) {
      ownerStudentId = toStudentId((studentData as { student_code: string }).student_code);
    }
  }

  return {
    id: toRepairId(row.repair_code),
    deviceSerial: (deviceData as { serial: string }).serial,
    ownerStudentId,
    issue: row.issue,
    priority: row.priority,
    status: row.status,
    openedDate: row.opened_date,
    diagnosis: row.diagnosis,
    serviceRoute: row.service_route,
    sentForServiceDate: row.sent_for_service_date,
    completedDate: row.completed_date,
    verifiedDate: row.verified_date,
  };
}
