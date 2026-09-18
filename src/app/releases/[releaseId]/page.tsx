import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";
import {
  getDeviceBySerial,
  getReleaseById,
} from "@/data/domain";

type ReleaseDetailPageProps = {
  params: Promise<{
    releaseId: string;
  }>;
};

export default async function ReleaseDetailPage({
  params,
}: ReleaseDetailPageProps) {
  const { releaseId } = await params;

  const release = getReleaseById(releaseId);

  if (!release) {
    return (
      <main className="flex min-h-screen bg-slate-950 text-white">
        <AppSidebar />

        <section className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-medium text-slate-500">
              Release Workflow
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Release record not found
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              No synthetic release exists for {releaseId}.
            </p>

            <Link
              href="/releases"
              className="mt-6 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Return to Releases
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const device = getDeviceBySerial(release.deviceSerial);

  if (!device) {
    return (
      <main className="flex min-h-screen bg-slate-950 text-white">
        <AppSidebar />

        <section className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-medium text-slate-500">
              Release Workflow
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Linked device unavailable
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              The release exists, but its linked device record could
              not be resolved.
            </p>

            <Link
              href="/releases"
              className="mt-6 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Return to Releases
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const sourceHref =
    release.source.type === "Return"
      ? `/returns/${release.source.id}`
      : `/repairs/${release.source.id}`;

  return (
    <main className="flex min-h-screen bg-slate-950 text-white">
      <AppSidebar />

      <section className="flex-1 px-8 py-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Release Workflow
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                {release.id}
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Device release eligibility and next-state transition
              </p>
            </div>

            <Link
              href="/releases"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Back to Releases
            </Link>
          </header>

          <section className="mt-8">
            <h2 className="text-lg font-semibold">
              Current State
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Eligibility
                </p>

                <p className="mt-2 font-medium">
                  {release.eligibility}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Status
                </p>

                <p className="mt-2 font-medium">
                  {release.status}
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
                  Source Workflow
                </p>

                <Link
                  href={sourceHref}
                  className="mt-2 inline-flex font-medium underline decoration-slate-600 underline-offset-4"
                >
                  {release.source.id}
                </Link>
              </article>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold">
              Release Details
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Proposed Action
                </p>

                <p className="mt-2 font-medium">
                  {release.action}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Validation
                </p>

                <p className="mt-2 font-medium">
                  {release.validation}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Release Date
                </p>

                <p className="mt-2 font-medium">
                  {release.releaseDate ?? "—"}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Resulting Device State
                </p>

                <p className="mt-2 font-medium">
                  {release.resultingDeviceState ?? "Pending"}
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
                  Release evaluation created
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Device {device.assetTag} entered release evaluation
                </p>
              </div>

              <div className="border-b border-slate-800 px-5 py-4">
                <p className="font-medium">
                  Source workflow checked
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {release.source.type} {release.source.id}
                </p>
              </div>

              {release.eligibility === "Eligible" ? (
                <div className="border-b border-slate-800 px-5 py-4">
                  <p className="font-medium">
                    Release eligibility confirmed
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {release.validation}
                  </p>
                </div>
              ) : (
                <div className="border-b border-slate-800 px-5 py-4">
                  <p className="font-medium">
                    Release blocked
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {release.validation}
                  </p>
                </div>
              )}

              <div className="px-5 py-4">
                <p className="font-medium">
                  Current release state
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {release.status}
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}