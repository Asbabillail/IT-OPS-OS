import "server-only";

import type {
  ByodId,
  ByodRecord,
  FacultyId,
  StudentId,
} from "@/data/domain/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type ByodRow = {
  id: string;
  byod_code: string;
  owner_type: "Student" | "Faculty";
  student_id: string | null;
  faculty_id: string | null;
  device_model: string;
  serial: string;
  ownership: "Student Owned" | "Faculty Owned";
  enrollment_status: "Enrolled" | "Pending";
  compliance_status: "Compliant" | "Review Required";
  registered_date: string;
  enrolled_date: string | null;
  reviewed_date: string | null;
};

type StudentRow = {
  id: string;
  student_code: string;
  name: string;
};

type FacultyRow = {
  id: string;
  faculty_code: string;
  name: string;
};

export type ByodDirectoryRow = {
  record: ByodRecord;
  ownerName: string;
};

function toByodId(value: string): ByodId {
  if (!value.startsWith("BYOD-")) {
    throw new Error(`Invalid byod_code returned from database: ${value}`);
  }

  return value as ByodId;
}

function toStudentId(value: string): StudentId {
  if (!value.startsWith("STU-")) {
    throw new Error(`Invalid student_code returned from database: ${value}`);
  }

  return value as StudentId;
}

function toFacultyId(value: string): FacultyId {
  if (!value.startsWith("FAC-")) {
    throw new Error(`Invalid faculty_code returned from database: ${value}`);
  }

  return value as FacultyId;
}

export async function listByodDirectory(): Promise<ByodDirectoryRow[]> {
  const supabase = getSupabaseServerClient();

  const { data: byodData, error: byodError } = await supabase
    .from("byod_records")
    .select(
      "id,byod_code,owner_type,student_id,faculty_id,device_model,serial,ownership,enrollment_status,compliance_status,registered_date,enrolled_date,reviewed_date",
    )
    .order("registered_date", { ascending: false });

  if (byodError) {
    throw new Error(`Failed to load BYOD records: ${byodError.message}`, {
      cause: byodError,
    });
  }

  const byodRecords = byodData as ByodRow[];

  if (byodRecords.length === 0) {
    return [];
  }

  const studentIds = [
    ...new Set(
      byodRecords
        .filter((row) => row.student_id !== null)
        .map((row) => row.student_id as string),
    ),
  ];

  const facultyIds = [
    ...new Set(
      byodRecords
        .filter((row) => row.faculty_id !== null)
        .map((row) => row.faculty_id as string),
    ),
  ];

  const [studentResult, facultyResult] = await Promise.all([
    studentIds.length > 0
      ? supabase
          .from("students")
          .select("id,student_code,name")
          .in("id", studentIds)
      : Promise.resolve({ data: [] as StudentRow[], error: null }),
    facultyIds.length > 0
      ? supabase
          .from("faculty")
          .select("id,faculty_code,name")
          .in("id", facultyIds)
      : Promise.resolve({ data: [] as FacultyRow[], error: null }),
  ]);

  if (studentResult.error) {
    throw new Error(
      `Failed to resolve BYOD student owners: ${studentResult.error.message}`,
      { cause: studentResult.error },
    );
  }

  if (facultyResult.error) {
    throw new Error(
      `Failed to resolve BYOD faculty owners: ${facultyResult.error.message}`,
      { cause: facultyResult.error },
    );
  }

  const studentById = new Map(
    (studentResult.data as StudentRow[]).map((student) => [
      student.id,
      student,
    ]),
  );

  const facultyById = new Map(
    (facultyResult.data as FacultyRow[]).map((faculty) => [
      faculty.id,
      faculty,
    ]),
  );

  return byodRecords.map((row) => {
    let owner: ByodRecord["owner"];
    let ownerName: string;

    if (row.owner_type === "Student") {
      const student = row.student_id
        ? studentById.get(row.student_id)
        : undefined;

      if (!student) {
        throw new Error(
          `BYOD record ${row.byod_code} references an unresolved student`,
        );
      }

      owner = { type: "Student", id: toStudentId(student.student_code) };
      ownerName = student.name;
    } else {
      const faculty = row.faculty_id
        ? facultyById.get(row.faculty_id)
        : undefined;

      if (!faculty) {
        throw new Error(
          `BYOD record ${row.byod_code} references an unresolved faculty member`,
        );
      }

      owner = { type: "Faculty", id: toFacultyId(faculty.faculty_code) };
      ownerName = faculty.name;
    }

    return {
      record: {
        id: toByodId(row.byod_code),
        owner,
        deviceModel: row.device_model,
        serial: row.serial,
        ownership: row.ownership,
        enrollmentStatus: row.enrollment_status,
        complianceStatus: row.compliance_status,
        registeredDate: row.registered_date,
        enrolledDate: row.enrolled_date,
        reviewedDate: row.reviewed_date,
      },
      ownerName,
    };
  });
}
