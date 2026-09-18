import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";
import { getStudentById } from "@/lib/repositories/students";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type StudentProfilePageProps = {
  params: Promise<{
    studentId: string;
  }>;
};

type AssignmentRow = {
  device_id: string;
};

type DeviceData = {
  id: string;
  serial: string;
  assetTag: string;
  model: string;
  status: string;
};

export default async function StudentProfilePage({
  params,
}: StudentProfilePageProps) {
  const { studentId } = await params;

  const student = await getStudentById(studentId);

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
              No student record found for {studentId}.
            </p>

            <Link
              href="/students"
              className="mt-6 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Return to Students
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const supabase = getSupabaseServerClient();

  const { data: studentIdData } = await supabase
    .from("students")
    .select("id")
    .eq("student_code", student.id)
    .maybeSingle();

  let assignmentData: AssignmentRow | null = null;

  if (studentIdData) {
    const { data } = await supabase
      .from("device_assignments")
      .select("device_id")
      .eq("assignee_type", "Student")
      .eq("status", "Active")
      .is("returned_at", null)
      .eq("student_id", (studentIdData as { id: string }).id)
      .maybeSingle();

    assignmentData = data as AssignmentRow | null;
  }

  let assignedDevice: DeviceData | null = null;

  if (assignmentData) {
    const assignment = assignmentData as AssignmentRow;
    const { data: deviceData } = await supabase
      .from("devices")
      .select("id,serial,asset_tag,model,status")
      .eq("id", assignment.device_id)
      .maybeSingle();

    if (deviceData) {
      const dbDevice = deviceData as {
        id: string;
        serial: string;
        asset_tag: string;
        model: string;
        status: string;
      };
      assignedDevice = {
        id: dbDevice.id,
        serial: dbDevice.serial,
        assetTag: dbDevice.asset_tag,
        model: dbDevice.model,
        status: dbDevice.status,
      };
    }
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
                {student.id} · Grade {student.grade}
              </p>
            </div>

            <Link
              href="/students"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Back to Students
            </Link>
          </header>

          <section
            aria-labelledby="student-details"
            className="mt-8"
          >
            <h2
              id="student-details"
              className="text-lg font-semibold"
            >
              Student Details
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Student ID
                </p>

                <p className="mt-2 font-medium">
                  {student.id}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Grade
                </p>

                <p className="mt-2 font-medium">
                  {student.grade}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  School Email
                </p>

                <p className="mt-2 font-medium">
                  {student.email}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Enrollment
                </p>

                <p className="mt-2 font-medium">
                  {student.enrollmentStatus}
                </p>
              </article>
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
                {student.guardian.name}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {student.guardian.phone}
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
                  {assignedDevice?.serial ?? "—"}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Asset Tag
                </p>

                <p className="mt-2 font-medium">
                  {assignedDevice?.assetTag ?? "—"}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Model
                </p>

                <p className="mt-2 font-medium">
                  {assignedDevice?.model ?? "—"}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Status
                </p>

                <p className="mt-2 font-medium">
                  {assignedDevice?.status ?? "Not Assigned"}
                </p>
              </article>
            </div>

            {assignedDevice ? (
              <Link
                href={`/devices/${assignedDevice.serial}`}
                className="mt-4 inline-flex text-sm font-medium text-slate-300 underline decoration-slate-600 underline-offset-4 transition hover:text-white"
              >
                Open Device Profile
              </Link>
            ) : null}
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

              {assignedDevice ? (
                <>
                  <div className="border-b border-slate-800 px-5 py-4">
                    <p className="font-medium">
                      Device assigned
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {assignedDevice.assetTag} · {assignedDevice.serial}
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
        </div>
      </section>
    </main>
  );
}