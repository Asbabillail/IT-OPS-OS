import Link from "next/link";

import { DistributionForm } from "@/components/distribution-form";
import { AppSidebar } from "@/components/app-sidebar";
import { listDistributionDirectory } from "@/lib/repositories/distributions";
import { listDevices } from "@/lib/repositories/devices";
import { listStudents } from "@/lib/repositories/students";

export const dynamic = "force-dynamic";

export default async function DistributionPage() {
  const [directory, students, devices] = await Promise.all([
    listDistributionDirectory(),
    listStudents(),
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
              Distribution
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Track device handover, physical signatures, and IT
              verification.
            </p>
          </header>

          <section className="mt-8 mb-12">
            <DistributionForm students={students} devices={devices} />
          </section>

          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                Distribution Queue
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Live Phase 1 Supabase data
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <div className="hidden grid-cols-[1fr_1.1fr_1fr_1fr_1fr_1.2fr_auto] gap-4 border-b border-slate-800 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
                <span>Distribution ID</span>
                <span>Student</span>
                <span>Student ID</span>
                <span>Asset Tag</span>
                <span>Status</span>
                <span>Signature</span>
                <span>Workflow</span>
              </div>

              {directory.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm font-medium text-slate-300">
                    No distribution records found
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Distribution records will appear here once device
                    handovers are recorded in Supabase.
                  </p>
                </div>
              ) : (
                directory.map(
                  ({ distribution, studentName, assetTag }) => (
                    <article
                      key={distribution.id}
                      className="grid gap-4 border-b border-slate-800 px-5 py-4 last:border-b-0 lg:grid-cols-[1fr_1.1fr_1fr_1fr_1fr_1.2fr_auto] lg:items-center"
                    >
                      <p className="text-sm text-slate-300">
                        {distribution.id}
                      </p>

                      <p className="font-medium text-white">
                        {studentName}
                      </p>

                      <p className="text-sm text-slate-300">
                        {distribution.studentId}
                      </p>

                      <p className="text-sm text-slate-300">
                        {assetTag}
                      </p>

                      <p className="text-sm text-slate-300">
                        {distribution.status}
                      </p>

                      <p className="text-sm text-slate-300">
                        {distribution.signatureStatus}
                      </p>

                      <Link
                        href={`/distribution/${distribution.id}`}
                        className="inline-flex justify-self-start rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 lg:justify-self-end"
                      >
                        Open Workflow
                      </Link>
                    </article>
                  ),
                )
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
