import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";
import {
  getByodRecordById,
  getFacultyById,
  getStudentById,
} from "@/data/domain";

type ByodDetailPageProps = {
  params: Promise<{
    byodId: string;
  }>;
};

export default async function ByodDetailPage({
  params,
}: ByodDetailPageProps) {
  const { byodId } = await params;

  const record = getByodRecordById(byodId);

  if (!record) {
    return (
      <main className="flex min-h-screen bg-slate-950 text-white">
        <AppSidebar />

        <section className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-medium text-slate-500">
              BYOD Record
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              BYOD record not found
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              No synthetic BYOD record exists for {byodId}.
            </p>

            <Link
              href="/byod"
              className="mt-6 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Return to BYOD
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const owner =
    record.owner.type === "Student"
      ? getStudentById(record.owner.id)
      : getFacultyById(record.owner.id);

  if (!owner) {
    return (
      <main className="flex min-h-screen bg-slate-950 text-white">
        <AppSidebar />

        <section className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-medium text-slate-500">
              BYOD Record
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Linked owner unavailable
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              The BYOD record exists, but its linked owner could not
              be resolved.
            </p>

            <Link
              href="/byod"
              className="mt-6 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Return to BYOD
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const ownerHref =
    record.owner.type === "Student"
      ? `/students/${record.owner.id}`
      : `/faculty/${record.owner.id}`;

  return (
    <main className="flex min-h-screen bg-slate-950 text-white">
      <AppSidebar />

      <section className="flex-1 px-8 py-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                BYOD Record
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                {record.id}
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Privately owned device enrollment and compliance
                lifecycle
              </p>
            </div>

            <Link
              href="/byod"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Back to BYOD
            </Link>
          </header>

          <section className="mt-8">
            <h2 className="text-lg font-semibold">
              Current State
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Owner
                </p>

                <Link
                  href={ownerHref}
                  className="mt-2 inline-flex font-medium underline decoration-slate-600 underline-offset-4"
                >
                  {owner.name}
                </Link>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Ownership
                </p>

                <p className="mt-2 font-medium">
                  {record.ownership}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Enrollment
                </p>

                <p className="mt-2 font-medium">
                  {record.enrollmentStatus}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Compliance
                </p>

                <p className="mt-2 font-medium">
                  {record.complianceStatus}
                </p>
              </article>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold">
              Device Details
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Model
                </p>

                <p className="mt-2 font-medium">
                  {record.deviceModel}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Serial
                </p>

                <p className="mt-2 font-medium">
                  {record.serial}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Owner Type
                </p>

                <p className="mt-2 font-medium">
                  {record.owner.type}
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
                  BYOD registered
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {record.registeredDate}
                </p>
              </div>

              {record.enrolledDate ? (
                <div className="border-b border-slate-800 px-5 py-4">
                  <p className="font-medium">
                    Device enrollment completed
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {record.enrolledDate}
                  </p>
                </div>
              ) : (
                <div className="border-b border-slate-800 px-5 py-4">
                  <p className="font-medium">
                    Enrollment pending
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Device has not completed enrollment
                  </p>
                </div>
              )}

              {record.reviewedDate ? (
                <div className="px-5 py-4">
                  <p className="font-medium">
                    Compliance review completed
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {record.reviewedDate}
                  </p>
                </div>
              ) : (
                <div className="px-5 py-4">
                  <p className="font-medium">
                    Compliance review required
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    IT review is required before approval
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