import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";
import { listFacultyDirectory } from "@/lib/repositories/faculty";

export const dynamic = "force-dynamic";

export default async function FacultyPage() {
  const directory = await listFacultyDirectory();

  return (
    <main className="flex min-h-screen bg-slate-950 text-white">
      <AppSidebar />

      <section className="flex-1 px-8 py-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                People
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                Faculty
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Browse faculty records and open their 360° operational
                profiles.
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
            aria-labelledby="faculty-directory"
            className="mt-8"
          >
            <div className="mb-4">
              <h2
                id="faculty-directory"
                className="text-lg font-semibold"
              >
                Faculty Directory
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Live Phase 1 Supabase data
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <div className="hidden grid-cols-[1.1fr_1fr_1fr_1.3fr_0.9fr_0.9fr_auto] gap-4 border-b border-slate-800 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
                <span>Faculty</span>
                <span>Faculty ID</span>
                <span>Department</span>
                <span>Email</span>
                <span>Device</span>
                <span>Asset Tag</span>
                <span>Profile</span>
              </div>

              {directory.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm font-medium text-slate-300">
                    No faculty records found
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Faculty records will appear here once they are added to
                    Supabase.
                  </p>
                </div>
              ) : (
                directory.map(({ faculty, activeAssetTags }) => (
                  <article
                    key={faculty.id}
                    className="grid gap-4 border-b border-slate-800 px-5 py-4 last:border-b-0 lg:grid-cols-[1.1fr_1fr_1fr_1.3fr_0.9fr_0.9fr_auto] lg:items-center"
                  >
                    <p className="font-medium text-white">
                      {faculty.name}
                    </p>

                    <p className="text-sm text-slate-300">
                      {faculty.id}
                    </p>

                    <p className="text-sm text-slate-300">
                      {faculty.department}
                    </p>

                    <p className="text-sm text-slate-300">
                      {faculty.email}
                    </p>

                    <p className="text-sm text-slate-300">
                      {activeAssetTags.length > 0
                        ? "Assigned"
                        : "Not Assigned"}
                    </p>

                    <p className="text-sm text-slate-300">
                      {activeAssetTags.length > 0
                        ? activeAssetTags.join(", ")
                        : "—"}
                    </p>

                    <Link
                      href={`/faculty/${faculty.id}`}
                      className="inline-flex justify-self-start rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 lg:justify-self-end"
                    >
                      Open Profile
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
