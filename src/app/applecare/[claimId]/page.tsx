import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";
import { getAppleCareClaimById } from "@/lib/repositories/applecare";
import { getDeviceBySerial } from "@/lib/repositories/devices";
import { getRepairById } from "@/lib/repositories/repairs";
import { getStudentById } from "@/lib/repositories/students";

type AppleCareClaimPageProps = {
  params: Promise<{
    claimId: string;
  }>;
};

export default async function AppleCareClaimPage({
  params,
}: AppleCareClaimPageProps) {
  const { claimId } = await params;

  const claim = await getAppleCareClaimById(claimId);

  if (!claim) {
    return (
      <main className="flex min-h-screen bg-slate-950 text-white">
        <AppSidebar />

        <section className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-medium text-slate-500">
              AppleCare Claim
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              AppleCare claim not found
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              No AppleCare claim found for {claimId}.
            </p>

            <Link
              href="/applecare"
              className="mt-6 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Return to AppleCare
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const device = await getDeviceBySerial(claim.deviceSerial);
  const repair = await getRepairById(claim.repairId);

  const owner = claim.ownerStudentId
    ? await getStudentById(claim.ownerStudentId)
    : null;

  if (!device || !repair) {
    return (
      <main className="flex min-h-screen bg-slate-950 text-white">
        <AppSidebar />

        <section className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-medium text-slate-500">
              AppleCare Claim
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Linked record unavailable
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              The claim exists, but its linked device or repair record
              could not be resolved.
            </p>

            <Link
              href="/applecare"
              className="mt-6 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Return to AppleCare
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-slate-950 text-white">
      <AppSidebar />

      <section className="flex-1 px-8 py-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                AppleCare Claim
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                {claim.id}
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Coverage entitlement and claim lifecycle
              </p>
            </div>

            <Link
              href="/applecare"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Back to AppleCare
            </Link>
          </header>

          <section className="mt-8">
            <h2 className="text-lg font-semibold">
              Current State
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Coverage
                </p>

                <p className="mt-2 font-medium">
                  {claim.coverage}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Claim Status
                </p>

                <p className="mt-2 font-medium">
                  {claim.claimStatus}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Device
                </p>

                <Link
                  href={`/devices/${device.serial}`}
                  className="mt-2 inline-flex font-medium underline decoration-slate-600 underline-offset-4"
                >
                  {device.assetTag}
                </Link>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Repair Case
                </p>

                <Link
                  href={`/repairs/${repair.id}`}
                  className="mt-2 inline-flex font-medium underline decoration-slate-600 underline-offset-4"
                >
                  {repair.id}
                </Link>
              </article>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold">
              Claim Details
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Issue
                </p>

                <p className="mt-2 font-medium">
                  {claim.issue}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Service Type
                </p>

                <p className="mt-2 font-medium">
                  {claim.serviceType}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Submitted Date
                </p>

                <p className="mt-2 font-medium">
                  {claim.submittedDate ?? "—"}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Decision Date
                </p>

                <p className="mt-2 font-medium">
                  {claim.decisionDate ?? "—"}
                </p>
              </article>
            </div>
          </section>

          {owner ? (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">
                Current Owner
              </h2>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-5">
                <Link
                  href={`/students/${owner.id}`}
                  className="font-medium underline decoration-slate-600 underline-offset-4"
                >
                  {owner.name}
                </Link>

                <p className="mt-1 text-sm text-slate-500">
                  {owner.id}
                </p>
              </div>
            </section>
          ) : null}

          <section className="mt-8 pb-8">
            <h2 className="text-lg font-semibold">
              Workflow Timeline
            </h2>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <div className="border-b border-slate-800 px-5 py-4">
                <p className="font-medium">
                  AppleCare coverage confirmed
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Coverage status: {claim.coverage}
                </p>
              </div>

              <div className="border-b border-slate-800 px-5 py-4">
                <p className="font-medium">
                  Repair case linked
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {repair.id}
                </p>
              </div>

              {claim.submittedDate ? (
                <div className="border-b border-slate-800 px-5 py-4">
                  <p className="font-medium">
                    AppleCare claim submitted
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {claim.submittedDate}
                  </p>
                </div>
              ) : (
                <div className="border-b border-slate-800 px-5 py-4">
                  <p className="font-medium">
                    AppleCare claim not required
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Repair is being handled without an AppleCare claim
                  </p>
                </div>
              )}

              {claim.claimStatus === "Submitted" ? (
                <div className="px-5 py-4">
                  <p className="font-medium">
                    Claim decision pending
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Awaiting AppleCare claim decision
                  </p>
                </div>
              ) : (
                <div className="px-5 py-4">
                  <p className="font-medium">
                    No claim decision required
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Current repair does not require AppleCare claim processing
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}