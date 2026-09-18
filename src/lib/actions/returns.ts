"use server";

import type { StudentId } from "@/data/domain/types";
import { createReturn } from "@/lib/repositories/returns";

export async function createReturnAction(
  studentId: StudentId,
  deviceSerial: string,
): Promise<{ id: string } | { error: string }> {
  try {
    const ret = await createReturn(studentId, deviceSerial);

    return { id: ret.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create return record";

    return { error: message };
  }
}
