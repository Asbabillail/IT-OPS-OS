import Link from "next/link";

import { ByodForm } from "@/components/byod-form";
import { AppSidebar } from "@/components/app-sidebar";
import { listByodDirectory } from "@/lib/repositories/byod";
import { listStudents } from "@/lib/repositories/students";

export const dynamic = "force-dynamic";

export default async function ByodPage() {
  const [directory, students] = await Promise.all([
    listByodDirectory(),
    listStudents(),
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
              BYOD
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Track privately owned devices, enrollment state, and
              compliance review.
            </p>
          </header>

          <section className="mt-8 mb-12">
            <ByodForm students={students} />
          </section>

          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                BYOD Registry
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Live Phase 1 Supabase data
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <div className="hidden grid-cols-[1fr_1.1fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b border-slate-800 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
                <span>BYOD ID</span>
                <span>Owner</span>
                <span>Device</span>
                <span>Serial</span>
                <span>Enrollment</span>
                <span>Compliance</span>
                <span>Record</span>
              </div>

              {directory.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm font-medium text-slate-300">
                    No BYOD records found
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    BYOD records will appear here once devices are
                    registered in Supabase.
                  </p>
                </div>
              ) : (
                directory.map(({ record, ownerName }) => (
                  <article
                    key={record.id}
                    className="grid gap-4 border-b border-slate-800 px-5 py-4 last:border-b-0 lg:grid-cols-[1fr_1.1fr_1fr_1fr_1fr_1fr_auto] lg:items-center"
                  >
                    <p className="text-sm text-slate-300">
                      {record.id}
                    </p>

                    <div>
                      <p className="font-medium text-white">
                        {ownerName}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {record.owner.id}
                      </p>
                    </div>

                    <p className="text-sm text-slate-300">
                      {record.deviceModel}
                    </p>

                    <p className="text-sm text-slate-300">
                      {record.serial}
                    </p>

                    <p className="text-sm text-slate-300">
                      {record.enrollmentStatus}
                    </p>

                    <p className="text-sm text-slate-300">
                      {record.complianceStatus}
                    </p>

                    <Link
                      href={`/byod/${record.id}`}
                      className="inline-flex justify-self-start rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 lg:justify-self-end"
                    >
                      Open Record
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