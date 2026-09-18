"use server";

import type { ReleaseId } from "@/data/domain/types";
import { createRelease } from "@/lib/repositories/releases";

export async function createReleaseAction(
  deviceSerial: string,
  sourceType: "Return" | "Repair",
  releaseDate: string,
): Promise<{ id: ReleaseId } | { error: string }> {
  try {
    const release = await createRelease(deviceSerial, sourceType, releaseDate);

    return { id: release.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create release";

    return { error: message };
  }
}
