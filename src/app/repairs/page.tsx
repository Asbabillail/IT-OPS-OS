import Link from "next/link";

import { RepairsForm } from "@/components/repairs-form";
import { AppSidebar } from "@/components/app-sidebar";
import { listRepairDirectory } from "@/lib/repositories/repairs";
import { listDevices } from "@/lib/repositories/devices";

export const dynamic = "force-dynamic";

export default async function RepairsPage() {
  const [directory, devices] = await Promise.all([
    listRepairDirectory(),
    listDevices(),
  ]);

  return (
    <main className="flex min-h-screen bg-slate-950 text-white">
      <AppSidebar />

      <section className="flex-1 px-8 py-8">
        <div className="mx-auto max-w-7xl">
          <header>
            <p className="text-sm font-medium text-slate-500">
              Workflow
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Repairs
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Track damaged devices, repair progress, vendor activity,
              and return-to-service state.
            </p>
          </header>

          <section className="mt-8 mb-12">
            <RepairsForm devices={devices} />
          </section>

          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                Repair Queue
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Live Phase 1 Supabase data
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <div className="hidden grid-cols-[1fr_1fr_1fr_1.2fr_0.8fr_1fr_1fr_auto] gap-4 border-b border-slate-800 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
                <span>Repair ID</span>
                <span>Asset Tag</span>
                <span>Serial</span>
                <span>Issue</span>
                <span>Priority</span>
                <span>Status</span>
                <span>Opened</span>
                <span>Case</span>
              </div>

              {directory.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm font-medium text-slate-300">
                    No repair records found
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Repair cases will appear here once devices are sent
                    in for service in Supabase.
                  </p>
                </div>
              ) : (
                directory.map(({ repair, assetTag }) => (
                  <article
                    key={repair.id}
                    className="grid gap-4 border-b border-slate-800 px-5 py-4 last:border-b-0 lg:grid-cols-[1fr_1fr_1fr_1.2fr_0.8fr_1fr_1fr_auto] lg:items-center"
                  >
                    <p className="text-sm text-slate-300">
                      {repair.id}
                    </p>

                    <p className="font-medium text-white">
                      {assetTag}
                    </p>

                    <p className="text-sm text-slate-300">
                      {repair.deviceSerial}
                    </p>

                    <p className="text-sm text-slate-300">
                      {repair.issue}
                    </p>

                    <p className="text-sm text-slate-300">
                      {repair.priority}
                    </p>

                    <p className="text-sm text-slate-300">
                      {repair.status}
                    </p>

                    <p className="text-sm text-slate-300">
                      {repair.openedDate}
                    </p>

                    <Link
                      href={`/repairs/${repair.id}`}
                      className="inline-flex justify-self-start rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 lg:justify-self-end"
                    >
                      Open Case
                    </Link>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}