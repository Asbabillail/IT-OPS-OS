"use client";

import { useActionState } from "react";
import { createApplecareAction } from "@/lib/actions/applecare";
import { FormWithLetterhead } from "./form-with-letterhead";

type ApplecareFormProps = {
  repairCases: Array<{ id: string; deviceSerial: string }>;
};

type FormState =
  | { error: string }
  | { success: boolean; id: string }
  | { error?: undefined; success?: undefined };

export function ApplecareForm({ repairCases }: ApplecareFormProps) {
  async function handleSubmit(
    _previousState: FormState,
    formData: FormData,
  ): Promise<FormState> {
    const repairId = formData.get("repairId") as string;
    const issue = formData.get("issue") as string;
    const serviceType = formData.get("serviceType") as string;

    if (!repairId || !issue || !serviceType) {
      return { error: "All fields are required" };
    }

    const result = await createApplecareAction(
      repairId,
      issue as "Accidental Damage" | "Battery Service",
      serviceType as "Display Repair" | "Internal Battery Service",
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
      title="AppleCare+ Claim"
      description="File an AppleCare+ claim for device repair"
    >
      <form action={formAction} className="space-y-6">
        <div>
          <label htmlFor="repairId" className="block text-sm font-medium text-slate-700">
            Repair Case
          </label>
          <select
            id="repairId"
            name="repairId"
            required
            disabled={isPending || isSuccess}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition disabled:opacity-50"
          >
            <option value="">Select a repair case...</option>
            {repairCases.map((repair) => (
              <option key={repair.id} value={repair.id}>
                {repair.id} ({repair.deviceSerial})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="issue" className="block text-sm font-medium text-slate-700">
            Issue Type
          </label>
          <select
            id="issue"
            name="issue"
            required
            disabled={isPending || isSuccess}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition disabled:opacity-50"
          >
            <option value="">Select issue type...</option>
            <option value="Accidental Damage">Accidental Damage</option>
            <option value="Battery Service">Battery Service</option>
          </select>
        </div>

        <div>
          <label htmlFor="serviceType" className="block text-sm font-medium text-slate-700">
            Service Type
          </label>
          <select
            id="serviceType"
            name="serviceType"
            required
            disabled={isPending || isSuccess}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition disabled:opacity-50"
          >
            <option value="">Select service type...</option>
            <option value="Display Repair">Display Repair</option>
            <option value="Internal Battery Service">Internal Battery Service</option>
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
              AppleCare claim {state.id} created successfully
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || isSuccess}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Filing..." : "File AppleCare Claim"}
        </button>
      </form>
    </FormWithLetterhead>
  );
}
