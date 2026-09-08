import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";

type ReturnDetailPageProps = {
  params: Promise<{
    returnId: string;
  }>;
};

const syntheticReturns = {
  "RET-2026-001": {
    id: "RET-2026-001",
    returnStatus: "Received",
    condition: "Good",
    accessories: "Complete",
    outcome: "Ready for Release",
    initiatedDate: "2026-09-03",
    receivedDate: "2026-09-04",
    inspectedDate: "2026-09-04",
    assignmentClosedDate: "2026-09-04",
    inspectionNotes: "Device returned in good operational condition.",
    student: {
      name: "Ayaan Rahman",
      id: "STU-2026-041",
      href: "/students/STU-2026-041",
    },
    device: {
      assetTag: "YIS-PAD-0412",
      serial: "DMQR92KX",
      href: "/devices/DMQR92KX",
    },
    repair: null,
  },

  "RET-2026-002": {
    id: "RET-2026-002",
    returnStatus: "Inspection Required",
    condition: "Screen Damage",
    accessories: "Missing Charger",
    outcome: "Repair Required",
    initiatedDate: "2026-09-08",
    receivedDate: "2026-09-08",
    inspectedDate: null,
    assignmentClosedDate: null,
    inspectionNotes:
      "Visible screen damage reported. Charger not returned with device.",
    student: {
      name: "Sara Khan",
      id: "STU-2026-089",
      href: "/students/STU-2026-089",
    },
    device: {
      assetTag: "YIS-PAD-0413",
      serial: "F9FT81LP",
      href: "/devices/F9FT81LP",
    },
    repair: {
      id: "REP-2026-002",
      href: "/repairs/REP-2026-002",
    },
  },
} as const;

export default async function ReturnDetailPage({
  params,
}: ReturnDetailPageProps) {
  const { returnId } = await params;

  const record =
    syntheticReturns[
      returnId as keyof typeof syntheticReturns
    ];

  if (!record) {
    return (
      <main className="flex min-h-screen bg-slate-950 text-white">
        <AppSidebar />

        <section className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-medium text-slate-500">
              Return Workflow
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Return record not found
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              No synthetic return exists for {returnId}.
            </p>

            <Link
              href="/returns"
              className="mt-6 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Return to Returns
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
                Return Workflow
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                {record.id}
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Device return, inspection, and assignment closure lifecycle
              </p>
            </div>

            <Link
              href="/returns"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Back to Returns
            </Link>
          </header>

          <section className="mt-8">
            <h2 className="text-lg font-semibold">
              Current State
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Return Status
                </p>

                <p className="mt-2 font-medium">
                  {record.returnStatus}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Condition
                </p>

                <p className="mt-2 font-medium">
                  {record.condition}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Student
                </p>

                <Link
                  href={record.student.href}
                  className="mt-2 inline-flex font-medium underline decoration-slate-600 underline-offset-4"
                >
                  {record.student.name}
                </Link>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Device
                </p>

                <Link
                  href={record.device.href}
                  className="mt-2 inline-flex font-medium underline decoration-slate-600 underline-offset-4"
                >
                  {record.device.assetTag}
                </Link>
              </article>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold">
              Return Details
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Received Date
                </p>

                <p className="mt-2 font-medium">
                  {record.receivedDate}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Accessories
                </p>

                <p className="mt-2 font-medium">
                  {record.accessories}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Outcome
                </p>

                <p className="mt-2 font-medium">
                  {record.outcome}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Assignment Closure
                </p>

                <p className="mt-2 font-medium">
                  {record.assignmentClosedDate ?? "Pending"}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5 md:col-span-2 xl:col-span-4">
                <p className="text-sm text-slate-500">
                  Inspection Notes
                </p>

                <p className="mt-2 font-medium">
                  {record.inspectionNotes}
                </p>
              </article>
            </div>
          </section>

          {record.repair ? (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">
                Linked Repair
              </h2>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-5">
                <Link
                  href={record.repair.href}
                  className="font-medium underline decoration-slate-600 underline-offset-4"
                >
                  {record.repair.id}
                </Link>

                <p className="mt-1 text-sm text-slate-500">
                  Repair workflow required before device can return to service.
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
                  Return initiated
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {record.initiatedDate}
                </p>
              </div>

              <div className="border-b border-slate-800 px-5 py-4">
                <p className="font-medium">
                  Device received
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {record.receivedDate}
                </p>
              </div>

              {record.inspectedDate ? (
                <div className="border-b border-slate-800 px-5 py-4">
                  <p className="font-medium">
                    Condition inspection completed
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {record.inspectedDate} · {record.condition}
                  </p>
                </div>
              ) : (
                <div className="border-b border-slate-800 px-5 py-4">
                  <p className="font-medium">
                    Condition inspection pending
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Device requires inspection before assignment closure
                  </p>
                </div>
              )}

              {record.assignmentClosedDate ? (
                <div className="border-b border-slate-800 px-5 py-4">
                  <p className="font-medium">
                    Assignment closed
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {record.assignmentClosedDate}
                  </p>
                </div>
              ) : (
                <div className="border-b border-slate-800 px-5 py-4">
                  <p className="font-medium">
                    Assignment closure pending
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Assignment remains open until return inspection is completed
                  </p>
                </div>
              )}

              <div className="px-5 py-4">
                <p className="font-medium">
                  {record.outcome}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {record.outcome === "Ready for Release"
                    ? "Device is eligible for the next release workflow."
                    : "Device must complete the repair workflow before release."}
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}