import "server-only";

import type { Student, StudentId } from "@/data/domain/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type StudentRow = {
  id: string;
  student_code: string;
  name: string;
  grade: string;
  email: string;
  enrollment_status: "Active" | "Inactive";
  guardian_name: string;
  guardian_phone: string;
};

type ActiveAssignmentRow = {
  student_id: string;
  device_id: string;
};

type DeviceRow = {
  id: string;
  asset_tag: string;
};

export type StudentDirectoryRow = {
  student: Student;
  activeAssetTags: string[];
};

function toStudentId(value: string): StudentId {
  if (!value.startsWith("STU-")) {
    throw new Error(`Invalid student_code returned from database: ${value}`);
  }

  return value as StudentId;
}

function mapStudentRow(row: StudentRow): Student {
  return {
    id: toStudentId(row.student_code),
    name: row.name,
    grade: row.grade,
    email: row.email,
    enrollmentStatus: row.enrollment_status,
    guardian: {
      name: row.guardian_name,
      phone: row.guardian_phone,
    },
  };
}

export async function listStudents(): Promise<Student[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("students")
    .select(
      "id,student_code,name,grade,email,enrollment_status,guardian_name,guardian_phone",
    )
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load students: ${error.message}`, {
      cause: error,
    });
  }

  return (data as StudentRow[]).map(mapStudentRow);
}

export async function listStudentDirectory(): Promise<StudentDirectoryRow[]> {
  const supabase = getSupabaseServerClient();

  const [
    { data: studentsData, error: studentsError },
    { data: assignmentsData, error: assignmentsError },
  ] = await Promise.all([
    supabase
      .from("students")
      .select(
        "id,student_code,name,grade,email,enrollment_status,guardian_name,guardian_phone",
      )
      .order("name", { ascending: true }),
    supabase
      .from("device_assignments")
      .select("student_id,device_id")
      .eq("assignee_type", "Student")
      .eq("status", "Active")
      .is("returned_at", null),
  ]);

  if (studentsError) {
    throw new Error(`Failed to load students: ${studentsError.message}`, {
      cause: studentsError,
    });
  }

  if (assignmentsError) {
    throw new Error(
      `Failed to load student device assignments: ${assignmentsError.message}`,
      { cause: assignmentsError },
    );
  }

  const students = studentsData as StudentRow[];
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

  const assetTagsByStudentId = new Map<string, string[]>();

  for (const assignment of assignments) {
    if (!assignment.student_id) {
      continue;
    }

    const assetTag = assetTagByDeviceId.get(assignment.device_id);

    if (!assetTag) {
      continue;
    }

    const current = assetTagsByStudentId.get(assignment.student_id) ?? [];
    current.push(assetTag);
    assetTagsByStudentId.set(assignment.student_id, current);
  }

  return students.map((row) => ({
    student: mapStudentRow(row),
    activeAssetTags: assetTagsByStudentId.get(row.id) ?? [],
  }));
}

export async function getStudentById(studentId: string): Promise<Student | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("students")
    .select(
      "id,student_code,name,grade,email,enrollment_status,guardian_name,guardian_phone",
    )
    .eq("student_code", studentId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to load student: ${error.message}`, {
      cause: error,
    });
  }

  return mapStudentRow(data as StudentRow);
}
