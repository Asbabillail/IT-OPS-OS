import "server-only";

import type {
  AppleCareClaimId,
  AppleCareClaim,
  RepairId,
  StudentId,
} from "@/data/domain/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type AppleCareRow = {
  id: string;
  claim_code: string;
  repair_id: string;
  coverage: "Active";
  claim_status: "Submitted" | "Not Required";
  issue: "Accidental Damage" | "Battery Service";
  service_type: "Display Repair" | "Internal Battery Service";
  submitted_date: string | null;
  decision_date: string | null;
};

type RepairRow = {
  id: string;
  repair_code: string;
  device_id: string;
  owner_student_id: string | null;
};

type StudentRow = {
  id: string;
  student_code: string;
};

type DeviceRow = {
  id: string;
  serial: string;
  asset_tag: string;
};

export type AppleCareDirectoryRow = {
  claim: AppleCareClaim;
  assetTag: string;
};

function toAppleCareClaimId(value: string): AppleCareClaimId {
  if (!value.startsWith("AC-")) {
    throw new Error(`Invalid claim_code returned from database: ${value}`);
  }

  return value as AppleCareClaimId;
}

function toRepairId(value: string): RepairId {
  if (!value.startsWith("REP-")) {
    throw new Error(`Invalid repair_code returned from database: ${value}`);
  }

  return value as RepairId;
}

function toStudentId(value: string | null): StudentId | null {
  if (value === null) {
    return null;
  }

  if (!value.startsWith("STU-")) {
    throw new Error(`Invalid student_code returned from database: ${value}`);
  }

  return value as StudentId;
}

export async function listAppleCareDirectory(): Promise<
  AppleCareDirectoryRow[]
> {
  const supabase = getSupabaseServerClient();

  const { data: claimData, error: claimError } = await supabase
    .from("applecare_claims")
    .select(
      "id,claim_code,repair_id,coverage,claim_status,issue,service_type,submitted_date,decision_date",
    )
    .order("created_at", { ascending: false });

  if (claimError) {
    throw new Error(
      `Failed to load AppleCare claims: ${claimError.message}`,
      { cause: claimError },
    );
  }

  const claimRows = claimData as AppleCareRow[];

  if (claimRows.length === 0) {
    return [];
  }

  const repairIds = [...new Set(claimRows.map((row) => row.repair_id))];

  const { data: repairData, error: repairError } = await supabase
    .from("repairs")
    .select("id,repair_code,device_id,owner_student_id")
    .in("id", repairIds);

  if (repairError) {
    throw new Error(
      `Failed to load repair data: ${repairError.message}`,
      { cause: repairError },
    );
  }

  const repairRows = repairData as RepairRow[];

  const deviceIds = [...new Set(repairRows.map((row) => row.device_id))];

  const studentIds = [
    ...new Set(
      repairRows
        .filter((row) => row.owner_student_id !== null)
        .map((row) => row.owner_student_id as string),
    ),
  ];

  const [
    { data: deviceData, error: deviceError },
    { data: studentData, error: studentError },
  ] = await Promise.all([
    supabase
      .from("devices")
      .select("id,serial,asset_tag")
      .in("id", deviceIds),
    studentIds.length > 0
      ? supabase
          .from("students")
          .select("id,student_code")
          .in("id", studentIds)
      : Promise.resolve({ data: [] as StudentRow[], error: null }),
  ]);

  if (deviceError) {
    throw new Error(
      `Failed to resolve devices: ${deviceError.message}`,
      { cause: deviceError },
    );
  }

  if (studentError) {
    throw new Error(
      `Failed to resolve owner students: ${studentError.message}`,
      { cause: studentError },
    );
  }

  const repairById = new Map(
    repairRows.map((repair) => [repair.id, repair]),
  );

  const studentById = new Map(
    (studentData as StudentRow[]).map((student) => [student.id, student]),
  );

  const deviceById = new Map(
    (deviceData as DeviceRow[]).map((device) => [device.id, device]),
  );

  return claimRows.map((row) => {
    const repair = repairById.get(row.repair_id);

    if (!repair) {
      throw new Error(
        `AppleCare claim ${row.claim_code} references an unresolved repair`,
      );
    }

    const device = deviceById.get(repair.device_id);

    if (!device) {
      throw new Error(
        `AppleCare claim ${row.claim_code} references an unresolved device`,
      );
    }

    let ownerStudentId: StudentId | null = null;

    if (repair.owner_student_id) {
      const student = studentById.get(repair.owner_student_id);

      if (student) {
        ownerStudentId = toStudentId(student.student_code);
      }
    }

    return {
      claim: {
        id: toAppleCareClaimId(row.claim_code),
        deviceSerial: device.serial,
        repairId: toRepairId(repair.repair_code),
        ownerStudentId,
        coverage: row.coverage,
        claimStatus: row.claim_status,
        issue: row.issue,
        serviceType: row.service_type,
        submittedDate: row.submitted_date,
        decisionDate: row.decision_date,
      },
      assetTag: device.asset_tag,
    };
  });
}
