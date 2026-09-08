import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";

const syntheticStudents = [
  {
    studentId: "STU-2026-041",
    name: "Ayaan Rahman",
    grade: "10A",
    email: "ayaan.rahman@yis.edu.sa",
    deviceStatus: "Assigned",
    assetTag: "YIS-PAD-0412",
  },
  {
    studentId: "STU-2026-089",
    name: "Sara Khan",
    grade: "8B",
    email: "sara.khan@yis.edu.sa",
    deviceStatus: "Not Assigned",
    assetTag: null,
  },
] as const;

export default function StudentsPage() {
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
                Students
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Browse student records and open their 360° operational profiles.
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
            aria-labelledby="student-directory"
            className="mt-8"
          >
            <div className="mb-4">
              <h2
                id="student-directory"
                className="text-lg font-semibold"
              >
                Student Directory
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Synthetic Phase 1 development data
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <div className="hidden grid-cols-[1.2fr_1fr_0.6fr_0.8fr_0.8fr_auto] gap-4 border-b border-slate-800 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
                <span>Student</span>
                <span>Student ID</span>
                <span>Grade</span>
                <span>Device</span>
                <span>Asset Tag</span>
                <span>Profile</span>
              </div>

              {syntheticStudents.map((student) => (
                <article
                  key={student.studentId}
                  className="grid gap-4 border-b border-slate-800 px-5 py-4 last:border-b-0 lg:grid-cols-[1.2fr_1fr_0.6fr_0.8fr_0.8fr_auto] lg:items-center"
                >
                  <div>
                    <p className="font-medium text-white">
                      {student.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500 lg:hidden">
                      {student.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 lg:hidden">
                      Student ID
                    </p>

                    <p className="mt-1 text-sm text-slate-300 lg:mt-0">
                      {student.studentId}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 lg:hidden">
                      Grade
                    </p>

                    <p className="mt-1 text-sm text-slate-300 lg:mt-0">
                      {student.grade}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 lg:hidden">
                      Device
                    </p>

                    <p className="mt-1 text-sm text-slate-300 lg:mt-0">
                      {student.deviceStatus}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 lg:hidden">
                      Asset Tag
                    </p>

                    <p className="mt-1 text-sm text-slate-300 lg:mt-0">
                      {student.assetTag ?? "—"}
                    </p>
                  </div>

                  <Link
                    href={`/students/${student.studentId}`}
                    className="inline-flex justify-self-start rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 lg:justify-self-end"
                  >
                    Open Profile
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