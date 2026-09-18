"use server";

import { createAppleCareClaim } from "@/lib/repositories/applecare";

export async function createApplecareAction(
  repairId: string,
  issue: "Accidental Damage" | "Battery Service",
  serviceType: "Display Repair" | "Internal Battery Service",
): Promise<{ id: string } | { error: string }> {
  try {
    const claim = await createAppleCareClaim(
      repairId as any,
      issue,
      serviceType,
    );

    return { id: claim.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create AppleCare claim";

    return { error: message };
  }
}
