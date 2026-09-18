import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";
import { getDeviceBySerial } from "@/lib/repositories/devices";
import { getRepairById } from "@/lib/repositories/repairs";
import { getStudentById } from "@/lib/repositories/students";

type RepairDetailPageProps = {
  params: Promise<{
    repairId: string;
  }>;
};

export default async function RepairDetailPage({
  params,
}: RepairDetailPageProps) {
  const { repairId } = await params;

  const repair = await getRepairById(repairId);

  if (!repair) {
    return (
      <main className="flex min-h-screen bg-slate-950 text-white">
        <AppSidebar />

        <section className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-medium text-slate-500">
              Repair Case
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Repair case not found
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              No repair case found for {repairId}.
            </p>

            <Link
              href="/repairs"
              className="mt-6 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Return to Repairs
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const device = await getDeviceBySerial(repair.deviceSerial);

  const owner = repair.ownerStudentId
    ? await getStudentById(repair.ownerStudentId)
    : null;

  if (!device) {
    return (
      <main className="flex min-h-screen bg-slate-950 text-white">
        <AppSidebar />

        <section className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-medium text-slate-500">
              Repair Case
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Linked device unavailable
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              The repair exists, but its linked device record could
              not be resolved.
            </p>

            <Link
              href="/repairs"
              className="mt-6 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Return to Repairs
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
                Repair Case
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                {repair.id}
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Device repair lifecycle and service history
              </p>
            </div>

            <Link
              href="/repairs"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Back to Repairs
            </Link>
          </header>

          <section className="mt-8">
            <h2 className="text-lg font-semibold">
              Current State
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Status
                </p>

                <p className="mt-2 font-medium">
                  {repair.status}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Priority
                </p>

                <p className="mt-2 font-medium">
                  {repair.priority}
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
                  Owner
                </p>

                {owner ? (
                  <Link
                    href={`/students/${owner.id}`}
                    className="mt-2 inline-flex font-medium underline decoration-slate-600 underline-offset-4"
                  >
                    {owner.name}
                  </Link>
                ) : (
                  <p className="mt-2 font-medium">
                    Unassigned
                  </p>
                )}
              </article>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold">
              Repair Details
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Issue
                </p>

                <p className="mt-2 font-medium">
                  {repair.issue}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Service Route
                </p>

                <p className="mt-2 font-medium">
                  {repair.serviceRoute}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5 md:col-span-2">
                <p className="text-sm text-slate-500">
                  Diagnosis
                </p>

                <p className="mt-2 font-medium">
                  {repair.diagnosis}
                </p>
              </article>
            </div>
          </section>

          <section className="mt-8 pb-8">
            <h2 className="text-lg font-semibold">
              Workflow Timeline
            </h2>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <div className="border-b border-slate-800 px-5 py-4">
                <p className="font-medium">
                  Repair case opened
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {repair.openedDate}
                </p>
              </div>

              <div className="border-b border-slate-800 px-5 py-4">
                <p className="font-medium">
                  Diagnosis recorded
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {repair.diagnosis}
                </p>
              </div>

              <div className="border-b border-slate-800 px-5 py-4">
                <p className="font-medium">
                  Sent for service
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {repair.sentForServiceDate} · {repair.serviceRoute}
                </p>
              </div>

              {repair.completedDate ? (
                <div className="border-b border-slate-800 px-5 py-4">
                  <p className="font-medium">
                    Repair completed
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {repair.completedDate}
                  </p>
                </div>
              ) : (
                <div className="border-b border-slate-800 px-5 py-4">
                  <p className="font-medium">
                    Repair in progress
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Current status: {repair.status}
                  </p>
                </div>
              )}

              {repair.verifiedDate ? (
                <div className="px-5 py-4">
                  <p className="font-medium">
                    Return-to-service verification completed
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {repair.verifiedDate}
                  </p>
                </div>
              ) : (
                <div className="px-5 py-4">
                  <p className="font-medium">
                    Return-to-service verification pending
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Verification will occur after repair completion
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