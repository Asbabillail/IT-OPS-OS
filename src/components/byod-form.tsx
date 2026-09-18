"use client";

import { useActionState } from "react";
import type { Student } from "@/data/domain/types";
import { createByodAction } from "@/lib/actions/byod";
import { FormWithLetterhead } from "./form-with-letterhead";

type ByodFormProps = {
  students: Student[];
};

type FormState =
  | { error: string }
  | { success: boolean; id: string }
  | { error?: undefined; success?: undefined };

export function ByodForm({ students }: ByodFormProps) {
  async function handleSubmit(
    _previousState: FormState,
    formData: FormData,
  ): Promise<FormState> {
    const studentId = formData.get("studentId") as string;
    const ownerType = formData.get("ownerType") as string;
    const deviceSerial = formData.get("deviceSerial") as string;
    const deviceModel = formData.get("deviceModel") as string;

    if (!studentId || !ownerType || !deviceSerial || !deviceModel) {
      return { error: "All fields are required" };
    }

    const result = await createByodAction(
      studentId as any,
      ownerType as "Student" | "Faculty",
      deviceSerial,
      deviceModel,
    );

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
      title="BYOD (Bring Your Own Device) Registration"
      description="Register a personal device for academic use"
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
          <label htmlFor="ownerType" className="block text-sm font-medium text-slate-700">
            Owner Type
          </label>
          <select
            id="ownerType"
            name="ownerType"
            required
            disabled={isPending || isSuccess}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition disabled:opacity-50"
          >
            <option value="">Select owner type...</option>
            <option value="Student">Student</option>
            <option value="Faculty">Faculty</option>
          </select>
        </div>

        <div>
          <label htmlFor="deviceSerial" className="block text-sm font-medium text-slate-700">
            Device Serial
          </label>
          <input
            id="deviceSerial"
            type="text"
            name="deviceSerial"
            placeholder="Device serial number"
            required
            disabled={isPending || isSuccess}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="deviceModel" className="block text-sm font-medium text-slate-700">
            Device Model
          </label>
          <input
            id="deviceModel"
            type="text"
            name="deviceModel"
            placeholder="e.g., iPad Pro 12.9, MacBook Air M2"
            required
            disabled={isPending || isSuccess}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition disabled:opacity-50"
          />
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        {isSuccess && (
          <div className="rounded-lg border border-green-300 bg-green-50 p-4">
            <p className="text-sm text-green-800">
              BYOD record {state.id} created successfully
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || isSuccess}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Register BYOD Device"}
        </button>
      </form>
    </FormWithLetterhead>
  );
}
