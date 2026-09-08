import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";

const syntheticDistributions = [
  {
    id: "DIST-2026-001",
    studentName: "Ayaan Rahman",
    studentId: "STU-2026-041",
    assetTag: "YIS-PAD-0412",
    serial: "DMQR92KX",
    status: "Verified",
    signatureStatus: "Verified",
  },
  {
    id: "DIST-2026-002",
    studentName: "Sara Khan",
    studentId: "STU-2026-089",
    assetTag: "YIS-PAD-0413",
    serial: "F9FT81LP",
    status: "Pending Signature",
    signatureStatus: "Awaiting Paper Return",
  },
] as const;

export default function DistributionPage() {
  return (
    <main className="flex min-h-screen bg-slate-950 text-white">
      <AppSidebar />

      <section className="flex-1 px-8 py-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Workflow
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                Distribution
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Track device handover, physical signatures, and IT verification.
              </p>
            </div>

            <Link
              href="/"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Back to Dashboard
            </Link>
          </header>

          <section
            aria-labelledby="distribution-queue"
            className="mt-8"
          >
            <div className="mb-4">
              <h2
                id="distribution-queue"
                className="text-lg font-semibold"
              >
                Distribution Queue
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Synthetic Phase 1 workflow data
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <div className="hidden grid-cols-[1fr_1.2fr_1fr_1fr_1fr_1.2fr] gap-4 border-b border-slate-800 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
                <span>Distribution ID</span>
                <span>Student</span>
                <span>Student ID</span>
                <span>Asset Tag</span>
                <span>Device Status</span>
                <span>Signature Status</span>
              </div>

              {syntheticDistributions.map((distribution) => (
                <article
                  key={distribution.id}
                  className="grid gap-4 border-b border-slate-800 px-5 py-4 last:border-b-0 lg:grid-cols-[1fr_1.2fr_1fr_1fr_1fr_1.2fr] lg:items-center"
                >
                  <p className="text-sm text-slate-300">
                    {distribution.id}
                  </p>

                  <p className="font-medium text-white">
                    {distribution.studentName}
                  </p>

                  <p className="text-sm text-slate-300">
                    {distribution.studentId}
                  </p>

                  <p className="text-sm text-slate-300">
                    {distribution.assetTag}
                  </p>

                  <p className="text-sm text-slate-300">
                    {distribution.status}
                  </p>

                  <p className="text-sm text-slate-300">
                    {distribution.signatureStatus}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}