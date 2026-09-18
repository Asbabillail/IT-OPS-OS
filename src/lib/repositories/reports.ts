import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type WorkflowStats = {
  devicesTotal: number;
  devicesAvailable: number;
  devicesAssigned: number;
  devicesInRepair: number;
  repairsOpen: number;
  repairsCompleted: number;
  returnsReceived: number;
  returnsPending: number;
  byodEnrolled: number;
  byodPending: number;
};

export async function getPhase1Stats(): Promise<WorkflowStats> {
  const supabase = getSupabaseServerClient();

  const [
    devicesResult,
    repairsResult,
    returnsResult,
    byodResult,
  ] = await Promise.all([
    supabase.from("devices").select("status"),
    supabase.from("repairs").select("status"),
    supabase.from("returns").select("return_status"),
    supabase.from("byod_records").select("enrollment_status"),
  ]);

  const devices = (devicesResult.data || []) as { status: string }[];
  const repairs = (repairsResult.data || []) as { status: string }[];
  const returns = (returnsResult.data || []) as { return_status: string }[];
  const byods = (byodResult.data || []) as { enrollment_status: string }[];

  return {
    devicesTotal: devices.length,
    devicesAvailable: devices.filter((d) => d.status === "Available").length,
    devicesAssigned: devices.filter((d) => d.status === "Assigned").length,
    devicesInRepair: devices.filter(
      (d) => d.status === "In Repair" || d.status === "Awaiting Parts",
    ).length,
    repairsOpen: repairs.filter((r) => r.status !== "Completed").length,
    repairsCompleted: repairs.filter((r) => r.status === "Completed").length,
    returnsReceived: returns.filter((r) => r.return_status === "Received")
      .length,
    returnsPending: returns.filter((r) => r.return_status === "Inspection Required")
      .length,
    byodEnrolled: byods.filter((b) => b.enrollment_status === "Enrolled").length,
    byodPending: byods.filter((b) => b.enrollment_status === "Pending").length,
  };
}
