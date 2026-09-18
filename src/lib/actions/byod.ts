"use server";

import type { StudentId } from "@/data/domain/types";
import { createByodRecord } from "@/lib/repositories/byod";

export async function createByodAction(
  ownerId: StudentId,
  ownerType: "Student" | "Faculty",
  deviceSerial: string,
  deviceModel: string,
): Promise<{ id: string } | { error: string }> {
  try {
    const byod = await createByodRecord(
      ownerId,
      ownerType,
      deviceSerial,
      deviceModel,
    );

    return { id: byod.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create BYOD record";

    return { error: message };
  }
}
