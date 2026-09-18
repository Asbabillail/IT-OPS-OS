"use server";

import type { RepairId } from "@/data/domain/types";
import { createRepair } from "@/lib/repositories/repairs";

export async function createRepairAction(
  deviceSerial: string,
  issue: string,
  priority: "High" | "Medium" | "Low",
): Promise<{ id: RepairId } | { error: string }> {
  try {
    const repair = await createRepair(deviceSerial, issue, priority);

    return { id: repair.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create repair";

    return { error: message };
  }
}
