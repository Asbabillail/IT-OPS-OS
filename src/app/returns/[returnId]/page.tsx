import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";
import { getDeviceBySerial } from "@/lib/repositories/devices";
import { getReturnById } from "@/lib/repositories/returns";
import { getStudentById } from "@/lib/repositories/students";

type ReturnDetailPageProps = {
  params: Promise<{
    returnId: string;
  }>;
};

export default async function ReturnDetailPage({
  params,
}: ReturnDetailPageProps) {
  const { returnId } = await params;

  const record = await getReturnById(returnId);

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
              No return record found for {returnId}.
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

  const student = await getStudentById(record.studentId);
  const device = await getDeviceBySerial(record.deviceSerial);

  if (!student || !device) {
    return (
      <main className="flex min-h-screen bg-slate-950 text-white">
        <AppSidebar />

        <section className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-medium text-slate-500">
              Return Workflow
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Linked record unavailable
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              The return exists, but its linked student or device
              record could not be resolved.
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
                Device return, inspection, and assignment closure
                lifecycle
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
                  href={`/students/${student.id}`}
                  className="mt-2 inline-flex font-medium underline decoration-slate-600 underline-offset-4"
                >
                  {student.name}
                </Link>
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
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold">
              Return Details
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Initiated Date
                </p>

                <p className="mt-2 font-medium">
                  {record.initiatedDate}
                </p>
              </article>

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
                  Inspected Date
                </p>

                <p className="mt-2 font-medium">
                  {record.inspectedDate ?? "Pending"}
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

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5 md:col-span-2">
                <p className="text-sm text-slate-500">
                  Inspection Notes
                </p>

                <p className="mt-2 font-medium">
                  {record.inspectionNotes}
                </p>
              </article>
            </div>
          </section>

          {record.repairId ? (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">
                Linked Repair
              </h2>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-5">
                <Link
                  href={`/repairs/${record.repairId}`}
                  className="font-medium underline decoration-slate-600 underline-offset-4"
                >
                  {record.repairId}
                </Link>

                <p className="mt-1 text-sm text-slate-500">
                  Repair workflow required before this return can
                  progress to release.
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
                  {record.initiatedDate} · Device {device.assetTag}
                  {" "}entered the return workflow
                </p>
              </div>

              <div className="border-b border-slate-800 px-5 py-4">
                <p className="font-medium">
                  Device received
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {record.receivedDate} · Device received from{" "}
                  {student.name}
                </p>
              </div>

              {record.inspectedDate ? (
                <div className="border-b border-slate-800 px-5 py-4">
                  <p className="font-medium">
                    Physical inspection completed
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {record.inspectedDate} · Condition:{" "}
                    {record.condition}
                  </p>
                </div>
              ) : (
                <div className="border-b border-slate-800 px-5 py-4">
                  <p className="font-medium">
                    Physical inspection pending
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Inspection is required before assignment closure.
                  </p>
                </div>
              )}

              {record.assignmentClosedDate ? (
                <div className="border-b border-slate-800 px-5 py-4">
                  <p className="font-medium">
                    Assignment closed
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {record.assignmentClosedDate} · Student-device
                    assignment lifecycle closed
                  </p>
                </div>
              ) : (
                <div className="border-b border-slate-800 px-5 py-4">
                  <p className="font-medium">
                    Assignment closure pending
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Current return state must be resolved before
                    assignment closure.
                  </p>
                </div>
              )}

              <div className="px-5 py-4">
                <p className="font-medium">
                  Current outcome
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {record.outcome}
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}