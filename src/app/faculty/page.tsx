import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";

const syntheticFaculty = [
  {
    facultyId: "FAC-2026-012",
    name: "Nadia Farooq",
    department: "Mathematics",
    email: "nadia.farooq@yis.edu.sa",
    deviceStatus: "Assigned",
    assetTag: "YIS-PAD-0521",
  },
  {
    facultyId: "FAC-2026-019",
    name: "Omar Siddiqui",
    department: "Science",
    email: "omar.siddiqui@yis.edu.sa",
    deviceStatus: "Not Assigned",
    assetTag: null,
  },
] as const;

export default function FacultyPage() {
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
                Browse faculty records and monitor operational device assignment state.
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
                Synthetic Phase 1 development data
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <div className="hidden grid-cols-[1.2fr_1fr_1fr_1.4fr_0.9fr_0.9fr] gap-4 border-b border-slate-800 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
                <span>Faculty</span>
                <span>Faculty ID</span>
                <span>Department</span>
                <span>Email</span>
                <span>Device</span>
                <span>Asset Tag</span>
              </div>

              {syntheticFaculty.map((faculty) => (
                <article
                  key={faculty.facultyId}
                  className="grid gap-4 border-b border-slate-800 px-5 py-4 last:border-b-0 lg:grid-cols-[1.2fr_1fr_1fr_1.4fr_0.9fr_0.9fr] lg:items-center"
                >
                  <div>
                    <p className="font-medium text-white">
                      {faculty.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 lg:hidden">
                      Faculty ID
                    </p>

                    <p className="mt-1 text-sm text-slate-300 lg:mt-0">
                      {faculty.facultyId}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 lg:hidden">
                      Department
                    </p>

                    <p className="mt-1 text-sm text-slate-300 lg:mt-0">
                      {faculty.department}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 lg:hidden">
                      Email
                    </p>

                    <p className="mt-1 text-sm text-slate-300 lg:mt-0">
                      {faculty.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 lg:hidden">
                      Device
                    </p>

                    <p className="mt-1 text-sm text-slate-300 lg:mt-0">
                      {faculty.deviceStatus}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 lg:hidden">
                      Asset Tag
                    </p>

                    <p className="mt-1 text-sm text-slate-300 lg:mt-0">
                      {faculty.assetTag ?? "—"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}