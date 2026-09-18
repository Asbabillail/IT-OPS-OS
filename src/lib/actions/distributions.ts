"use server";

import type { DistributionId, StudentId } from "@/data/domain/types";
import { createDistribution } from "@/lib/repositories/distributions";

export async function createDistributionAction(
  studentId: StudentId,
  deviceSerial: string,
  handoverDate: string,
): Promise<{ id: DistributionId } | { error: string }> {
  try {
    const distribution = await createDistribution(
      studentId,
      deviceSerial,
      handoverDate,
    );

    return { id: distribution.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create distribution";

    return { error: message };
  }
}
