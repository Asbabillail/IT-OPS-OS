import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";

const syntheticReturns = [
  {
    id: "RET-2026-001",
    studentName: "Ayaan Rahman",
    studentId: "STU-2026-041",
    assetTag: "YIS-PAD-0412",
    serial: "DMQR92KX",
    returnStatus: "Received",
    condition: "Good",
    outcome: "Ready for Release",
  },
  {
    id: "RET-2026-002",
    studentName: "Sara Khan",
    studentId: "STU-2026-089",
    assetTag: "YIS-PAD-0413",
    serial: "F9FT81LP",
    returnStatus: "Inspection Required",
    condition: "Screen Damage",
    outcome: "Repair Required",
  },
] as const;

export default function ReturnsPage() {
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
              Returns
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Track returned devices, condition inspection, assignment closure, and next operational state.
            </p>
          </header>

          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                Return Queue
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Synthetic Phase 1 workflow data
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <div className="hidden grid-cols-[1fr_1.1fr_1fr_1fr_1.1fr_1fr_1.1fr_auto] gap-4 border-b border-slate-800 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
                <span>Return ID</span>
                <span>Student</span>
                <span>Student ID</span>
                <span>Asset Tag</span>
                <span>Serial</span>
                <span>Status</span>
                <span>Outcome</span>
                <span>Return</span>
              </div>

              {syntheticReturns.map((record) => (
                <article
                  key={record.id}
                  className="grid gap-4 border-b border-slate-800 px-5 py-4 last:border-b-0 lg:grid-cols-[1fr_1.1fr_1fr_1fr_1.1fr_1fr_1.1fr_auto] lg:items-center"
                >
                  <p className="text-sm text-slate-300">
                    {record.id}
                  </p>

                  <p className="font-medium text-white">
                    {record.studentName}
                  </p>

                  <p className="text-sm text-slate-300">
                    {record.studentId}
                  </p>

                  <p className="text-sm text-slate-300">
                    {record.assetTag}
                  </p>

                  <p className="text-sm text-slate-300">
                    {record.serial}
                  </p>

                  <p className="text-sm text-slate-300">
                    {record.returnStatus}
                  </p>

                  <p className="text-sm text-slate-300">
                    {record.outcome}
                  </p>

                  <Link
                    href={`/returns/${record.id}`}
                    className="inline-flex justify-self-start rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 lg:justify-self-end"
                  >
                    Open Return
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}