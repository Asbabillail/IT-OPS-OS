import "server-only";

import type { Device, DeviceStatus } from "@/data/domain/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type DeviceRow = {
  id: string;
  serial: string;
  asset_tag: string;
  model: string;
  storage: string;
  status: DeviceStatus;
  purchase_date: string;
  warranty_status: "Active" | "Expired";
  applecare_status: "Active" | "Expired" | "None";
};

type ActiveAssignmentRow = {
  device_id: string;
  assignee_type: "Student" | "Faculty";
  student_id: string | null;
  faculty_id: string | null;
};

type PersonRow = {
  id: string;
  name: string;
};

export type DeviceDirectoryRow = {
  device: Device;
  assignedTo: string | null;
};

function mapDeviceRow(row: DeviceRow): Device {
  return {
    serial: row.serial,
    assetTag: row.asset_tag,
    model: row.model,
    storage: row.storage,
    status: row.status,
    purchaseDate: row.purchase_date,
    warrantyStatus: row.warranty_status,
    appleCareStatus: row.applecare_status,
  };
}

export async function listDevices(): Promise<Device[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("devices")
    .select(
      "id,serial,asset_tag,model,storage,status,purchase_date,warranty_status,applecare_status",
    )
    .order("asset_tag", { ascending: true });

  if (error) {
    throw new Error(`Failed to load devices: ${error.message}`, {
      cause: error,
    });
  }

  return (data as DeviceRow[]).map(mapDeviceRow);
}

export async function listDeviceDirectory(): Promise<DeviceDirectoryRow[]> {
  const supabase = getSupabaseServerClient();

  const [
    { data: devicesData, error: devicesError },
    { data: assignmentsData, error: assignmentsError },
  ] = await Promise.all([
    supabase
      .from("devices")
      .select(
        "id,serial,asset_tag,model,storage,status,purchase_date,warranty_status,applecare_status",
      )
      .order("asset_tag", { ascending: true }),
    supabase
      .from("device_assignments")
      .select("device_id,assignee_type,student_id,faculty_id")
      .eq("status", "Active")
      .is("returned_at", null),
  ]);

  if (devicesError) {
    throw new Error(`Failed to load devices: ${devicesError.message}`, {
      cause: devicesError,
    });
  }

  if (assignmentsError) {
    throw new Error(
      `Failed to load active device assignments: ${assignmentsError.message}`,
      { cause: assignmentsError },
    );
  }

  const devices = devicesData as DeviceRow[];
  const assignments = assignmentsData as ActiveAssignmentRow[];

  const studentIds = [
    ...new Set(
      assignments
        .filter(
          (assignment) =>
            assignment.assignee_type === "Student" &&
            assignment.student_id !== null,
        )
        .map((assignment) => assignment.student_id as string),
    ),
  ];

  const facultyIds = [
    ...new Set(
      assignments
        .filter(
          (assignment) =>
            assignment.assignee_type === "Faculty" &&
            assignment.faculty_id !== null,
        )
        .map((assignment) => assignment.faculty_id as string),
    ),
  ];

  const [studentResult, facultyResult] = await Promise.all([
    studentIds.length > 0
      ? supabase
          .from("students")
          .select("id,name")
          .in("id", studentIds)
      : Promise.resolve({ data: [] as PersonRow[], error: null }),
    facultyIds.length > 0
      ? supabase
          .from("faculty")
          .select("id,name")
          .in("id", facultyIds)
      : Promise.resolve({ data: [] as PersonRow[], error: null }),
  ]);

  if (studentResult.error) {
    throw new Error(
      `Failed to resolve assigned students: ${studentResult.error.message}`,
      { cause: studentResult.error },
    );
  }

  if (facultyResult.error) {
    throw new Error(
      `Failed to resolve assigned faculty: ${facultyResult.error.message}`,
      { cause: facultyResult.error },
    );
  }

  const studentNameById = new Map(
    (studentResult.data as PersonRow[]).map((student) => [
      student.id,
      student.name,
    ]),
  );

  const facultyNameById = new Map(
    (facultyResult.data as PersonRow[]).map((faculty) => [
      faculty.id,
      faculty.name,
    ]),
  );

  const assignedToByDeviceId = new Map<string, string>();

  for (const assignment of assignments) {
    if (
      assignment.assignee_type === "Student" &&
      assignment.student_id !== null
    ) {
      assignedToByDeviceId.set(
        assignment.device_id,
        studentNameById.get(assignment.student_id) ?? "Unknown Student",
      );

      continue;
    }

    if (
      assignment.assignee_type === "Faculty" &&
      assignment.faculty_id !== null
    ) {
      assignedToByDeviceId.set(
        assignment.device_id,
        facultyNameById.get(assignment.faculty_id) ?? "Unknown Faculty",
      );
    }
  }

  return devices.map((row) => ({
    device: mapDeviceRow(row),
    assignedTo: assignedToByDeviceId.get(row.id) ?? null,
  }));
}

export async function getDeviceBySerial(
  serial: string,
): Promise<Device | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("devices")
    .select(
      "id,serial,asset_tag,model,storage,status,purchase_date,warranty_status,applecare_status",
    )
    .eq("serial", serial)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to load device: ${error.message}`, {
      cause: error,
    });
  }

  return mapDeviceRow(data as DeviceRow);
}
