"use client";

import { useActionState } from "react";
import type { Device } from "@/data/domain/types";
import { createRepairAction } from "@/lib/actions/repairs";
import { FormWithLetterhead } from "./form-with-letterhead";

type RepairsFormProps = {
  devices: Device[];
};

type FormState =
  | { error: string }
  | { success: boolean; id: string }
  | { error?: undefined; success?: undefined };

export function RepairsForm({ devices }: RepairsFormProps) {
  async function handleSubmit(
    _previousState: FormState,
    formData: FormData,
  ): Promise<FormState> {
    const deviceSerial = formData.get("deviceSerial") as string;
    const issue = formData.get("issue") as string;
    const priority = formData.get("priority") as string;

    if (!deviceSerial || !issue || !priority) {
      return { error: "All fields are required" };
    }

    const result = await createRepairAction(
      deviceSerial,
      issue,
      priority as "High" | "Medium" | "Low",
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
      title="Device Repair Case"
      description="Open a new repair case for a device"
    >
      <form action={formAction} className="space-y-6">
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

        <div>
          <label htmlFor="issue" className="block text-sm font-medium text-slate-700">
            Issue Description
          </label>
          <textarea
            id="issue"
            name="issue"
            placeholder="Describe the device issue..."
            required
            disabled={isPending || isSuccess}
            rows={4}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-slate-700">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            required
            disabled={isPending || isSuccess}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition disabled:opacity-50"
          >
            <option value="">Select priority...</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
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
              Repair case {state.id} created successfully
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || isSuccess}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Open Repair Case"}
        </button>
      </form>
    </FormWithLetterhead>
  );
}
