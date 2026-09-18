import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";
import { getFacultyById } from "@/lib/repositories/faculty";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type FacultyProfilePageProps = {
  params: Promise<{
    facultyId: string;
  }>;
};

type AssignmentRow = {
  device_id: string;
};

type DeviceData = {
  serial: string;
  assetTag: string;
  model: string;
  status: string;
};

export default async function FacultyProfilePage({
  params,
}: FacultyProfilePageProps) {
  const { facultyId } = await params;

  const facultyMember = await getFacultyById(facultyId);

  if (!facultyMember) {
    return (
      <main className="flex min-h-screen bg-slate-950 text-white">
        <AppSidebar />

        <section className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-medium text-slate-500">
              Faculty Profile
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Faculty record not found
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              No faculty record found for {facultyId}.
            </p>

            <Link
              href="/faculty"
              className="mt-6 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Return to Faculty
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const supabase = getSupabaseServerClient();

  const { data: facultyIdData } = await supabase
    .from("faculty")
    .select("id")
    .eq("faculty_code", facultyMember.id)
    .maybeSingle();

  let assignmentData: AssignmentRow | null = null;

  if (facultyIdData) {
    const { data } = await supabase
      .from("device_assignments")
      .select("device_id")
      .eq("assignee_type", "Faculty")
      .eq("status", "Active")
      .is("returned_at", null)
      .eq("faculty_id", (facultyIdData as { id: string }).id)
      .maybeSingle();

    assignmentData = data as AssignmentRow | null;
  }

  let assignedDevice: DeviceData | null = null;

  if (assignmentData) {
    const { data: deviceData } = await supabase
      .from("devices")
      .select("id,serial,asset_tag,model,status")
      .eq("id", (assignmentData as { device_id: string }).device_id)
      .maybeSingle();

    if (deviceData) {
      const dbDevice = deviceData as {
        serial: string;
        asset_tag: string;
        model: string;
        status: string;
      };
      assignedDevice = {
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
                Faculty 360° Profile
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                {facultyMember.name}
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                {facultyMember.id} · {facultyMember.department}
              </p>
            </div>

            <Link
              href="/faculty"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Back to Faculty
            </Link>
          </header>

          <section
            aria-labelledby="faculty-details"
            className="mt-8"
          >
            <h2
              id="faculty-details"
              className="text-lg font-semibold"
            >
              Faculty Details
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Faculty ID
                </p>

                <p className="mt-2 font-medium">
                  {facultyMember.id}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Department
                </p>

                <p className="mt-2 font-medium">
                  {facultyMember.department}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  School Email
                </p>

                <p className="mt-2 font-medium">
                  {facultyMember.email}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Employment
                </p>

                <p className="mt-2 font-medium">
                  {facultyMember.employmentStatus}
                </p>
              </article>
            </div>
          </section>

          <section
            aria-labelledby="faculty-device"
            className="mt-8"
          >
            <h2
              id="faculty-device"
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
            aria-labelledby="faculty-timeline"
            className="mt-8 pb-8"
          >
            <h2
              id="faculty-timeline"
              className="text-lg font-semibold"
            >
              Timeline
            </h2>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <div className="border-b border-slate-800 px-5 py-4">
                <p className="font-medium">
                  Faculty record created
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Synthetic staff intake completed
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
                      Device handover recorded
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Faculty device assignment recorded by IT
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