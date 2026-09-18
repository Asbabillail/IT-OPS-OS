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

export async function getByodRecordById(
  byodId: string,
): Promise<ByodRecord | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("byod_records")
    .select(
      "id,byod_code,owner_type,student_id,faculty_id,device_model,serial,ownership,enrollment_status,compliance_status,registered_date,enrolled_date,reviewed_date",
    )
    .eq("byod_code", byodId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to load BYOD record: ${error.message}`, {
      cause: error,
    });
  }

  const row = data as ByodRow;
  let owner: ByodRecord["owner"];

  if (row.owner_type === "Student" && row.student_id) {
    const { data: studentData } = await supabase
      .from("students")
      .select("student_code")
      .eq("id", row.student_id)
      .single();

    if (studentData) {
      owner = {
        type: "Student",
        id: toStudentId((studentData as { student_code: string }).student_code),
      };
    } else {
      return null;
    }
  } else if (row.owner_type === "Faculty" && row.faculty_id) {
    const { data: facultyData } = await supabase
      .from("faculty")
      .select("faculty_code")
      .eq("id", row.faculty_id)
      .single();

    if (facultyData) {
      owner = {
        type: "Faculty",
        id: toFacultyId((facultyData as { faculty_code: string }).faculty_code),
      };
    } else {
      return null;
    }
  } else {
    return null;
  }

  return {
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
  };
}

export async function createByodRecord(
  ownerId: StudentId | FacultyId,
  ownerType: "Student" | "Faculty",
  serial: string,
  deviceModel: string,
): Promise<ByodRecord> {
  const supabase = getSupabaseServerClient();

  let studentId: string | null = null;
  let facultyId: string | null = null;

  if (ownerType === "Student") {
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("id")
      .eq("student_code", ownerId)
      .single();

    if (studentError) {
      throw new Error("Student not found");
    }

    studentId = (studentData as { id: string }).id;
  } else {
    const { data: facultyData, error: facultyError } = await supabase
      .from("faculty")
      .select("id")
      .eq("faculty_code", ownerId)
      .single();

    if (facultyError) {
      throw new Error("Faculty not found");
    }

    facultyId = (facultyData as { id: string }).id;
  }

  const registeredDate = new Date().toISOString().split("T")[0];

  const { data: byodData, error: byodError } = await supabase
    .from("byod_records")
    .insert({
      student_id: studentId,
      faculty_id: facultyId,
      device_model: deviceModel,
      serial,
      ownership: "Student Owned",
      enrollment_status: "Pending Enrollment",
      compliance_status: "Pending Review",
      registered_date: registeredDate,
      enrolled_date: null,
      reviewed_date: null,
    })
    .select("byod_code")
    .single();

  if (byodError) {
    throw new Error(`Failed to create BYOD record: ${byodError.message}`);
  }

  const byod = byodData as { byod_code: string };

  const owner: ByodRecord["owner"] =
    ownerType === "Student"
      ? { type: "Student", id: ownerId as StudentId }
      : { type: "Faculty", id: ownerId as FacultyId };

  return {
    id: toByodId(byod.byod_code),
    owner,
    deviceModel,
    serial,
    ownership: "Student Owned",
    enrollmentStatus: "Pending",
    complianceStatus: "Review Required",
    registeredDate,
    enrolledDate: null,
    reviewedDate: null,
  };
}

export async function updateByodStatus(
  byodId: ByodId,
  enrollmentStatus?: "Enrolled" | "Pending",
  complianceStatus?: "Compliant" | "Review Required",
  enrolledDate?: string,
  reviewedDate?: string,
): Promise<ByodRecord> {
  const supabase = getSupabaseServerClient();

  const updateData: Record<string, unknown> = {};
  if (enrollmentStatus) updateData.enrollment_status = enrollmentStatus;
  if (complianceStatus) updateData.compliance_status = complianceStatus;
  if (enrolledDate) updateData.enrolled_date = enrolledDate;
  if (reviewedDate) updateData.reviewed_date = reviewedDate;

  const { data: byodData, error: byodError } = await supabase
    .from("byod_records")
    .update(updateData)
    .eq("byod_code", byodId)
    .select(
      "byod_code,student_id,faculty_id,device_model,serial,ownership,enrollment_status,compliance_status,registered_date,enrolled_date,reviewed_date",
    )
    .single();

  if (byodError) {
    throw new Error(`Failed to update BYOD record: ${byodError.message}`);
  }

  const row = byodData as ByodRow;

  let owner: ByodRecord["owner"];

  if (row.student_id) {
    const { data: studentData } = await supabase
      .from("students")
      .select("student_code")
      .eq("id", row.student_id)
      .single();

    owner = {
      type: "Student",
      id: toStudentId((studentData as { student_code: string }).student_code),
    };
  } else {
    const { data: facultyData } = await supabase
      .from("faculty")
      .select("faculty_code")
      .eq("id", row.faculty_id!)
      .single();

    owner = {
      type: "Faculty",
      id: toFacultyId((facultyData as { faculty_code: string }).faculty_code),
    };
  }

  return {
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
  };
}
