"use client";

import { useActionState } from "react";
import type { Device, Student } from "@/data/domain/types";
import { createReturnAction } from "@/lib/actions/returns";
import { FormWithLetterhead } from "./form-with-letterhead";

type ReturnsFormProps = {
  students: Student[];
  devices: Device[];
};

type FormState =
  | { error: string }
  | { success: boolean; id: string }
  | { error?: undefined; success?: undefined };

export function ReturnsForm({ students, devices }: ReturnsFormProps) {
  async function handleSubmit(
    _previousState: FormState,
    formData: FormData,
  ): Promise<FormState> {
    const studentId = formData.get("studentId") as string;
    const deviceSerial = formData.get("deviceSerial") as string;

    if (!studentId || !deviceSerial) {
      return { error: "All fields are required" };
    }

    const result = await createReturnAction(studentId as any, deviceSerial);

    if ("error" in result) {
      return result;
    }

    return { success: true, id: result.id };
  }

  const [state, formAction, isPending] = useActionState(handleSubmit, {});

  const isSuccess = "success" in state && state.success;
  const errorMessage = "error" in state ? state.error : undefined;

  return (
    <FormWithLetterhead
      title="Device Return"
      description="Record a device return from a student"
    >
      <form action={formAction} className="space-y-6">
        <div>
          <label htmlFor="studentId" className="block text-sm font-medium text-slate-700">
            Student
          </label>
          <select
            id="studentId"
            name="studentId"
            required
            disabled={isPending || isSuccess}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition disabled:opacity-50"
          >
            <option value="">Select a student...</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="deviceSerial" className="block text-sm font-medium text-slate-700">
            Device (Serial)
          </label>
          <select
            id="deviceSerial"
            name="deviceSerial"
            required
            disabled={isPending || isSuccess}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition disabled:opacity-50"
          >
            <option value="">Select a device...</option>
            {devices.map((device) => (
              <option key={device.serial} value={device.serial}>
                {device.assetTag} ({device.serial})
              </option>
            ))}
          </select>
        </div>


        {errorMessage && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        {isSuccess && (
          <div className="rounded-lg border border-green-300 bg-green-50 p-4">
            <p className="text-sm text-green-800">
              Return record {state.id} created successfully
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || isSuccess}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Recording..." : "Record Device Return"}
        </button>
      </form>
    </FormWithLetterhead>
  );
}
