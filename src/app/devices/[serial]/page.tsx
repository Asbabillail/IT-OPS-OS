import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";
import {
  getDeviceBySerial,
  getFacultyById,
  getStudentById,
} from "@/data/domain";

type DeviceProfilePageProps = {
  params: Promise<{
    serial: string;
  }>;
};

export default async function DeviceProfilePage({
  params,
}: DeviceProfilePageProps) {
  const { serial } = await params;

  const device = getDeviceBySerial(serial);

  if (!device) {
    return (
      <main className="flex min-h-screen bg-slate-950 text-white">
        <AppSidebar />

        <section className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-medium text-slate-500">
              Device Profile
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Device not found
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              No synthetic device record exists for serial {serial}.
            </p>

            <Link
              href="/devices"
              className="mt-6 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Return to iPad Inventory
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const assignedStudent = device.assignedStudentId
    ? getStudentById(device.assignedStudentId)
    : null;

  const assignedFaculty = device.assignedFacultyId
    ? getFacultyById(device.assignedFacultyId)
    : null;

  const assignedPerson = assignedStudent ?? assignedFaculty;

  const assignedPersonHref = assignedStudent
    ? `/students/${assignedStudent.id}`
    : assignedFaculty
      ? `/faculty/${assignedFaculty.id}`
      : null;

  const assignmentType = assignedStudent
    ? "Student"
    : assignedFaculty
      ? "Faculty"
      : null;

  return (
    <main className="flex min-h-screen bg-slate-950 text-white">
      <AppSidebar />

      <section className="flex-1 px-8 py-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Device 360° Profile
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                {device.assetTag}
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Serial {device.serial} · {device.model}
              </p>
            </div>

            <Link
              href="/devices"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Back to iPad Inventory
            </Link>
          </header>

          <section
            aria-labelledby="device-details"
            className="mt-8"
          >
            <h2
              id="device-details"
              className="text-lg font-semibold"
            >
              Device Details
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Serial Number
                </p>

                <p className="mt-2 font-medium">
                  {device.serial}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Asset Tag
                </p>

                <p className="mt-2 font-medium">
                  {device.assetTag}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Model
                </p>

                <p className="mt-2 font-medium">
                  {device.model}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Storage
                </p>

                <p className="mt-2 font-medium">
                  {device.storage}
                </p>
              </article>
            </div>
          </section>

          <section
            aria-labelledby="lifecycle-status"
            className="mt-8"
          >
            <h2
              id="lifecycle-status"
              className="text-lg font-semibold"
            >
              Lifecycle Status
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Status
                </p>

                <p className="mt-2 font-medium">
                  {device.status}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Purchase Date
                </p>

                <p className="mt-2 font-medium">
                  {device.purchaseDate}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Warranty
                </p>

                <p className="mt-2 font-medium">
                  {device.warrantyStatus}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  AppleCare
                </p>

                <p className="mt-2 font-medium">
                  {device.appleCareStatus}
                </p>
              </article>
            </div>
          </section>

          <section
            aria-labelledby="current-assignment"
            className="mt-8"
          >
            <h2
              id="current-assignment"
              className="text-lg font-semibold"
            >
              Current Assignment
            </h2>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-5">
              {assignedPerson && assignedPersonHref ? (
                <>
                  <p className="font-medium">
                    {assignedPerson.name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {assignedPerson.id} · {assignmentType}
                  </p>

                  <Link
                    href={assignedPersonHref}
                    className="mt-4 inline-flex text-sm font-medium text-slate-300 underline decoration-slate-600 underline-offset-4 transition hover:text-white"
                  >
                    Open {assignmentType} Profile
                  </Link>
                </>
              ) : (
                <>
                  <p className="font-medium">
                    Unassigned
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    No active assignment exists for this device.
                  </p>
                </>
              )}
            </div>
          </section>

          <section
            aria-labelledby="device-timeline"
            className="mt-8 pb-8"
          >
            <h2
              id="device-timeline"
              className="text-lg font-semibold"
            >
              Timeline
            </h2>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <div className="border-b border-slate-800 px-5 py-4">
                <p className="font-medium">
                  Device registered
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Asset {device.assetTag} added to the synthetic fleet
                </p>
              </div>

              {assignedPerson ? (
                <>
                  <div className="border-b border-slate-800 px-5 py-4">
                    <p className="font-medium">
                      Device assigned
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Assigned to {assignedPerson.name}
                    </p>
                  </div>

                  <div className="px-5 py-4">
                    <p className="font-medium">
                      Distribution form verified
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Physical handover documentation recorded by IT
                    </p>
                  </div>
                </>
              ) : device.status === "Awaiting Parts" ||
                device.status === "In Repair" ? (
                <div className="px-5 py-4">
                  <p className="font-medium">
                    Repair workflow active
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Current operational state: {device.status}
                  </p>
                </div>
              ) : (
                <div className="px-5 py-4">
                  <p className="font-medium">
                    Available for assignment
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    No active assignment exists
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