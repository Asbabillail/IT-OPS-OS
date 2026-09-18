import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";
import { listReleaseDirectory } from "@/lib/repositories/releases";

export const dynamic = "force-dynamic";

export default async function ReleasesPage() {
  const directory = await listReleaseDirectory();

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
              Releases
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Evaluate device readiness and control transition into the
              next operational state.
            </p>
          </header>

          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                Release Queue
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Live Phase 1 Supabase data
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <div className="hidden grid-cols-[1fr_1fr_1fr_1fr_1fr_1.2fr_1.2fr_auto] gap-4 border-b border-slate-800 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
                <span>Release ID</span>
                <span>Asset Tag</span>
                <span>Serial</span>
                <span>Source</span>
                <span>Eligibility</span>
                <span>Action</span>
                <span>Status</span>
                <span>Release</span>
              </div>

              {directory.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm font-medium text-slate-300">
                    No release records found
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Release records will appear here once returns or
                    repairs are ready for device release in Supabase.
                  </p>
                </div>
              ) : (
                directory.map(({ release, assetTag }) => (
                  <article
                    key={release.id}
                    className="grid gap-4 border-b border-slate-800 px-5 py-4 last:border-b-0 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1.2fr_1.2fr_auto] lg:items-center"
                  >
                    <p className="text-sm text-slate-300">
                      {release.id}
                    </p>

                    <p className="font-medium text-white">
                      {assetTag}
                    </p>

                    <p className="text-sm text-slate-300">
                      {release.deviceSerial}
                    </p>

                    <div>
                      <p className="text-sm text-slate-300">
                        {release.source.id}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {release.source.type}
                      </p>
                    </div>

                    <p className="text-sm text-slate-300">
                      {release.eligibility}
                    </p>

                    <p className="text-sm text-slate-300">
                      {release.action}
                    </p>

                    <p className="text-sm text-slate-300">
                      {release.status}
                    </p>

                    <Link
                      href={`/releases/${release.id}`}
                      className="inline-flex justify-self-start rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 lg:justify-self-end"
                    >
                      Open Release
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