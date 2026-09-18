import "server-only";

import type {
  ReleaseId,
  ReleaseRecord,
  RepairId,
  ReturnId,
} from "@/data/domain/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type ReleaseRow = {
  id: string;
  release_code: string;
  source_type: "Return" | "Repair";
  return_id: string | null;
  repair_id: string | null;
  eligibility: "Eligible" | "Blocked";
  action: "Release to Available" | "None";
  status: "Ready" | "Awaiting Repair Completion";
  validation: "Return workflow complete" | "Repair workflow incomplete";
  release_date: string | null;
  resulting_device_state:
    | "Assigned"
    | "Available"
    | "In Repair"
    | "Awaiting Parts"
    | null;
};

type ReturnRow = {
  id: string;
  assignment_id: string;
};

type AssignmentRow = {
  device_id: string;
};

type RepairRow = {
  device_id: string;
};

type DeviceRow = {
  id: string;
  serial: string;
  asset_tag: string;
};

export type ReleaseDirectoryRow = {
  release: ReleaseRecord;
  assetTag: string;
};

function toReleaseId(value: string): ReleaseId {
  if (!value.startsWith("REL-")) {
    throw new Error(`Invalid release_code returned from database: ${value}`);
  }

  return value as ReleaseId;
}

function toReturnId(value: string): ReturnId {
  if (!value.startsWith("RET-")) {
    throw new Error(`Invalid return_id returned from database: ${value}`);
  }

  return value as ReturnId;
}

function toRepairId(value: string): RepairId {
  if (!value.startsWith("REP-")) {
    throw new Error(`Invalid repair_id returned from database: ${value}`);
  }

  return value as RepairId;
}

export async function listReleaseDirectory(): Promise<ReleaseDirectoryRow[]> {
  const supabase = getSupabaseServerClient();

  const { data: releaseData, error: releaseError } = await supabase
    .from("releases")
    .select(
      "id,release_code,source_type,return_id,repair_id,eligibility,action,status,validation,release_date,resulting_device_state",
    )
    .order("created_at", { ascending: false });

  if (releaseError) {
    throw new Error(`Failed to load releases: ${releaseError.message}`, {
      cause: releaseError,
    });
  }

  const releaseRows = releaseData as ReleaseRow[];

  if (releaseRows.length === 0) {
    return [];
  }

  const returnIds = [
    ...new Set(
      releaseRows
        .filter((row) => row.return_id !== null)
        .map((row) => row.return_id as string),
    ),
  ];

  const repairIds = [
    ...new Set(
      releaseRows
        .filter((row) => row.repair_id !== null)
        .map((row) => row.repair_id as string),
    ),
  ];

  const [returnResult, repairResult] = await Promise.all([
    returnIds.length > 0
      ? supabase
          .from("returns")
          .select("id,assignment_id")
          .in("id", returnIds)
      : Promise.resolve({ data: [] as ReturnRow[], error: null }),
    repairIds.length > 0
      ? supabase
          .from("repairs")
          .select("id,device_id")
          .in("id", repairIds)
      : Promise.resolve({ data: [] as (RepairRow & { id: string })[], error: null }),
  ]);

  if (returnResult.error) {
    throw new Error(
      `Failed to load release return sources: ${returnResult.error.message}`,
      { cause: returnResult.error },
    );
  }

  if (repairResult.error) {
    throw new Error(
      `Failed to load release repair sources: ${repairResult.error.message}`,
      { cause: repairResult.error },
    );
  }

  const returnById = new Map(
    (returnResult.data as ReturnRow[]).map((ret) => [ret.id, ret]),
  );

  const repairById = new Map(
    (repairResult.data as (RepairRow & { id: string })[]).map((rep) => [
      rep.id,
      rep,
    ]),
  );

  const assignmentIds = [
    ...new Set(
      (returnResult.data as ReturnRow[]).map((ret) => ret.assignment_id),
    ),
  ];

  const deviceIdsFromAssignments: string[] = [];
  const deviceIdsFromRepairs = [
    ...new Set(
      (repairResult.data as (RepairRow & { id: string })[]).map(
        (rep) => rep.device_id,
      ),
    ),
  ];

  const { data: assignmentData, error: assignmentError } =
    assignmentIds.length > 0
      ? await supabase
          .from("device_assignments")
          .select("id,device_id")
          .in("id", assignmentIds)
      : { data: [] as AssignmentRow[], error: null };

  if (assignmentError) {
    throw new Error(
      `Failed to load release assignment devices: ${assignmentError.message}`,
      { cause: assignmentError },
    );
  }

  deviceIdsFromAssignments.push(
    ...(assignmentData as (AssignmentRow & { id: string })[]).map(
      (a) => a.device_id,
    ),
  );

  const allDeviceIds = [...new Set([...deviceIdsFromAssignments, ...deviceIdsFromRepairs])];

  const { data: deviceData, error: deviceError } = await supabase
    .from("devices")
    .select("id,serial,asset_tag")
    .in("id", allDeviceIds);

  if (deviceError) {
    throw new Error(
      `Failed to resolve release devices: ${deviceError.message}`,
      { cause: deviceError },
    );
  }

  const assignmentById = new Map(
    (assignmentData as (AssignmentRow & { id: string })[]).map((a) => [
      a.id,
      a,
    ]),
  );

  const deviceById = new Map(
    (deviceData as DeviceRow[]).map((device) => [device.id, device]),
  );

  return releaseRows.map((row) => {
    let deviceId: string;

    if (row.source_type === "Return") {
      const returnRecord = returnById.get(row.return_id!);

      if (!returnRecord) {
        throw new Error(
          `Release ${row.release_code} references an unresolved return`,
        );
      }

      const assignment = assignmentById.get(returnRecord.assignment_id);

      if (!assignment) {
        throw new Error(
          `Release ${row.release_code} references an unresolved assignment`,
        );
      }

      deviceId = assignment.device_id;
    } else {
      const repairRecord = repairById.get(row.repair_id!);

      if (!repairRecord) {
        throw new Error(
          `Release ${row.release_code} references an unresolved repair`,
        );
      }

      deviceId = repairRecord.device_id;
    }

    const device = deviceById.get(deviceId);

    if (!device) {
      throw new Error(
        `Release ${row.release_code} references an unresolved device`,
      );
    }

    let source: ReleaseRecord["source"];

    if (row.source_type === "Return") {
      source = { type: "Return", id: toReturnId(row.return_id!) };
    } else {
      source = { type: "Repair", id: toRepairId(row.repair_id!) };
    }

    return {
      release: {
        id: toReleaseId(row.release_code),
        deviceSerial: device.serial,
        source,
        eligibility: row.eligibility,
        action: row.action,
        status: row.status,
        validation: row.validation,
        releaseDate: row.release_date,
        resultingDeviceState: row.resulting_device_state,
      },
      assetTag: device.asset_tag,
    };
  });
}
