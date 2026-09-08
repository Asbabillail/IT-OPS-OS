import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";

type StudentProfilePageProps = {
  params: Promise<{
    studentId: string;
  }>;
};

const syntheticStudents = {
  "STU-2026-041": {
    studentId: "STU-2026-041",
    name: "Ayaan Rahman",
    grade: "10A",
    email: "ayaan.rahman@yis.edu.sa",
    guardian: "Imran Rahman",
    guardianPhone: "+966 50 123 4567",
    enrollmentStatus: "Active",
    device: {
      serial: "DMQR92KX",
      assetTag: "YIS-PAD-0412",
      model: "iPad",
      status: "Assigned",
    },
  },
    "STU-2026-089": {
    studentId: "STU-2026-089",
    name: "Sara Khan",
    grade: "8B",
    email: "sara.khan@yis.edu.sa",
    guardian: "Ahmed Khan",
    guardianPhone: "+966 50 987 6543",
    enrollmentStatus: "Active",
    device: {
      serial: "—",
      assetTag: "—",
      model: "—",
      status: "Not Assigned",
    },
  },
} as const;


export default async function StudentProfilePage({
  params,
}: StudentProfilePageProps) {
  const { studentId } = await params;

  const student =
    syntheticStudents[studentId as keyof typeof syntheticStudents];

  if (!student) {
    return (
      <main className="flex min-h-screen bg-slate-950 text-white">
        <AppSidebar />

        <section className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-medium text-slate-500">
              Student Profile
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Student not found
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              No synthetic student record exists for {studentId}.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Return to Dashboard
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
                Student 360° Profile
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                {student.name}
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                {student.studentId} · Grade {student.grade}
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
            aria-labelledby="student-timeline"
            className="mt-8 pb-8"
          >
            <h2
              id="student-timeline"
              className="text-lg font-semibold"
            >
              Timeline
            </h2>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <div className="border-b border-slate-800 px-5 py-4">
                <p className="font-medium">
                  Student record created
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Synthetic enrollment intake completed
                </p>
             </div>

             {student.device.status === "Assigned" ? (
               <>
                 <div className="border-b border-slate-800 px-5 py-4">
                   <p className="font-medium">
                     Device assigned
                   </p>

                   <p className="mt-1 text-sm text-slate-500">
                     {student.device.assetTag} · {student.device.serial}
                  </p>
                 </div>

                 <div className="px-5 py-4">
                   <p className="font-medium">
                     Distribution form verified
                   </p>

                   <p className="mt-1 text-sm text-slate-500">
                     Physical document verification recorded by IT
                   </p>
                 </div>
                </>
              ) : (
                <div className="px-5 py-4">
                  <p className="font-medium">
                    Awaiting device assignment
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    No active device assignment exists
                  </p>
                </div>
              )}
            </div>
          </section>

          <section
            aria-labelledby="guardian-details"
            className="mt-8"
          >
            <h2
              id="guardian-details"
              className="text-lg font-semibold"
            >
              Guardian
            </h2>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="font-medium">
                {student.guardian}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {student.guardianPhone}
              </p>
            </div>
          </section>

          <section
            aria-labelledby="assigned-device"
            className="mt-8"
          >
            <h2
              id="assigned-device"
              className="text-lg font-semibold"
            >
              Assigned Device
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Serial Number
                </p>
                <p className="mt-2 font-medium">
                  {student.device.serial}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Asset Tag
                </p>
                <p className="mt-2 font-medium">
                  {student.device.assetTag}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Model
                </p>
                <p className="mt-2 font-medium">
                  {student.device.model}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Status
                </p>
                <p className="mt-2 font-medium">
                  {student.device.status}
                </p>
              </article>
            </div>
          </section>

          <section
            aria-labelledby="student-timeline"
            className="mt-8 pb-8"
          >
            <h2
              id="student-timeline"
              className="text-lg font-semibold"
            >
              Timeline
            </h2>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <div className="border-b border-slate-800 px-5 py-4">
                <p className="font-medium">
                  Student record created
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Synthetic enrollment intake completed
                </p>
              </div>

              <div className="border-b border-slate-800 px-5 py-4">
                <p className="font-medium">
                  Device assigned
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  YIS-PAD-0412 · DMQR92KX
                </p>
              </div>

              <div className="px-5 py-4">
                <p className="font-medium">
                  Distribution form verified
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Physical document verification recorded by IT
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}