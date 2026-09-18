"use client";

import { useActionState } from "react";
import type { Device } from "@/data/domain/types";
import { createReleaseAction } from "@/lib/actions/releases";
import { FormWithLetterhead } from "./form-with-letterhead";

type ReleasesFormProps = {
  devices: Device[];
};

type FormState =
  | { error: string }
  | { success: boolean; id: string }
  | { error?: undefined; success?: undefined };

export function ReleasesForm({ devices }: ReleasesFormProps) {
  async function handleSubmit(
    _previousState: FormState,
    formData: FormData,
  ): Promise<FormState> {
    const deviceSerial = formData.get("deviceSerial") as string;
    const sourceType = formData.get("sourceType") as string;
    const releaseDate = formData.get("releaseDate") as string;

    if (!deviceSerial || !sourceType || !releaseDate) {
      return { error: "All fields are required" };
    }

    const result = await createReleaseAction(
      deviceSerial,
      sourceType as "Return" | "Repair",
      releaseDate,
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
      title="Device Release"
      description="Release a device from repair or return workflow"
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
          <label htmlFor="sourceType" className="block text-sm font-medium text-slate-700">
            Release Source
          </label>
          <select
            id="sourceType"
            name="sourceType"
            required
            disabled={isPending || isSuccess}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition disabled:opacity-50"
          >
            <option value="">Select source...</option>
            <option value="Return">From Return Workflow</option>
            <option value="Repair">From Repair Workflow</option>
          </select>
        </div>

        <div>
          <label htmlFor="releaseDate" className="block text-sm font-medium text-slate-700">
            Release Date
          </label>
          <input
            id="releaseDate"
            type="date"
            name="releaseDate"
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
              Release record {state.id} created successfully
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || isSuccess}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Releasing..." : "Release Device"}
        </button>
      </form>
    </FormWithLetterhead>
  );
}
