import "server-only";

import type { Student, StudentId } from "@/data/domain/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type StudentRow = {
  student_code: string;
  name: string;
  grade: string;
  email: string;
  enrollment_status: "Active" | "Inactive";
  guardian_name: string;
  guardian_phone: string;
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
      "student_code,name,grade,email,enrollment_status,guardian_name,guardian_phone",
    )
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load students: ${error.message}`, {
      cause: error,
    });
  }

  return (data as StudentRow[]).map(mapStudentRow);
}
