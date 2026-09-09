import "server-only";

import type { Faculty, FacultyId } from "@/data/domain/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type FacultyRow = {
  id: string;
  faculty_code: string;
  name: string;
  department: string;
  email: string;
  employment_status: "Active" | "Inactive";
};

type ActiveAssignmentRow = {
  faculty_id: string;
  device_id: string;
};

type DeviceRow = {
  id: string;
  asset_tag: string;
};

export type FacultyDirectoryRow = {
  faculty: Faculty;
  activeAssetTags: string[];
};

function toFacultyId(value: string): FacultyId {
  if (!value.startsWith("FAC-")) {
    throw new Error(`Invalid faculty_code returned from database: ${value}`);
  }

  return value as FacultyId;
}

function mapFacultyRow(row: FacultyRow): Faculty {
  return {
    id: toFacultyId(row.faculty_code),
    name: row.name,
    department: row.department,
    email: row.email,
    employmentStatus: row.employment_status,
  };
}

export async function listFaculty(): Promise<Faculty[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("faculty")
    .select(
      "id,faculty_code,name,department,email,employment_status",
    )
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load faculty: ${error.message}`, {
      cause: error,
    });
  }

  return (data as FacultyRow[]).map(mapFacultyRow);
}

export async function listFacultyDirectory(): Promise<FacultyDirectoryRow[]> {
  const supabase = getSupabaseServerClient();

  const [
    { data: facultyData, error: facultyError },
    { data: assignmentsData, error: assignmentsError },
  ] = await Promise.all([
    supabase
      .from("faculty")
      .select(
        "id,faculty_code,name,department,email,employment_status",
      )
      .order("name", { ascending: true }),
    supabase
      .from("device_assignments")
      .select("faculty_id,device_id")
      .eq("assignee_type", "Faculty")
      .eq("status", "Active")
      .is("returned_at", null),
  ]);

  if (facultyError) {
    throw new Error(`Failed to load faculty: ${facultyError.message}`, {
      cause: facultyError,
    });
  }

  if (assignmentsError) {
    throw new Error(
      `Failed to load faculty device assignments: ${assignmentsError.message}`,
      { cause: assignmentsError },
    );
  }

  const faculty = facultyData as FacultyRow[];
  const assignments = assignmentsData as ActiveAssignmentRow[];

  const deviceIds = [...new Set(assignments.map((row) => row.device_id))];

  let devices: DeviceRow[] = [];

  if (deviceIds.length > 0) {
    const { data: devicesData, error: devicesError } = await supabase
      .from("devices")
      .select("id,asset_tag")
      .in("id", deviceIds);

    if (devicesError) {
      throw new Error(`Failed to load assigned devices: ${devicesError.message}`, {
        cause: devicesError,
      });
    }

    devices = devicesData as DeviceRow[];
  }

  const assetTagByDeviceId = new Map(
    devices.map((device) => [device.id, device.asset_tag]),
  );

  const assetTagsByFacultyId = new Map<string, string[]>();

  for (const assignment of assignments) {
    if (!assignment.faculty_id) {
      continue;
    }

    const assetTag = assetTagByDeviceId.get(assignment.device_id);

    if (!assetTag) {
      continue;
    }

    const current = assetTagsByFacultyId.get(assignment.faculty_id) ?? [];
    current.push(assetTag);
    assetTagsByFacultyId.set(assignment.faculty_id, current);
  }

  return faculty.map((row) => ({
    faculty: mapFacultyRow(row),
    activeAssetTags: assetTagsByFacultyId.get(row.id) ?? [],
  }));
}
