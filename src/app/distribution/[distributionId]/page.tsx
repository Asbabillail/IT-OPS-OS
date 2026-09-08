import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";

type DistributionProfilePageProps = {
  params: Promise<{
    distributionId: string;
  }>;
};

const syntheticDistributions = {
  "DIST-2026-001": {
    id: "DIST-2026-001",
    student: {
      name: "Ayaan Rahman",
      studentId: "STU-2026-041",
      href: "/students/STU-2026-041",
    },
    device: {
      assetTag: "YIS-PAD-0412",
      serial: "DMQR92KX",
      href: "/devices/DMQR92KX",
    },
    status: "Verified",
    signatureStatus: "Verified",
    handoverDate: "2026-08-25",
    returnedDate: "2026-08-26",
    verifiedDate: "2026-08-26",
  },

  "DIST-2026-002": {
    id: "DIST-2026-002",
    student: {
      name: "Sara Khan",
      studentId: "STU-2026-089",
      href: "/students/STU-2026-089",
    },
    device: {
      assetTag: "YIS-PAD-0413",
      serial: "F9FT81LP",
      href: "/devices/F9FT81LP",
    },
    status: "Pending Signature",
    signatureStatus: "Awaiting Paper Return",
    handoverDate: "2026-09-08",
    returnedDate: null,
    verifiedDate: null,
  },
} as const;

export default async function DistributionProfilePage({
  params,
}: DistributionProfilePageProps) {
  const { distributionId } = await params;

  const distribution =
    syntheticDistributions[
      distributionId as keyof typeof syntheticDistributions
    ];

  if (!distribution) {
    return (
      <main className="flex min-h-screen bg-slate-950 text-white">
        <AppSidebar />

        <section className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-medium text-slate-500">
              Distribution Workflow
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Distribution not found
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              No synthetic distribution exists for {distributionId}.
            </p>

            <Link
              href="/distribution"
              className="mt-6 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Return to Distribution
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
                Distribution Workflow
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                {distribution.id}
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Device handover and physical-signature lifecycle
              </p>
            </div>

            <Link
              href="/distribution"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
            >
              Back to Distribution
            </Link>
          </header>

          <section className="mt-8">
            <h2 className="text-lg font-semibold">
              Current State
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Distribution Status
                </p>

                <p className="mt-2 font-medium">
                  {distribution.status}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Signature Status
                </p>

                <p className="mt-2 font-medium">
                  {distribution.signatureStatus}
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Student
                </p>

                <Link
                  href={distribution.student.href}
                  className="mt-2 inline-flex font-medium underline decoration-slate-600 underline-offset-4"
                >
                  {distribution.student.name}
                </Link>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  Device
                </p>

                <Link
                  href={distribution.device.href}
                  className="mt-2 inline-flex font-medium underline decoration-slate-600 underline-offset-4"
                >
                  {distribution.device.assetTag}
                </Link>
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
                  Distribution created
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {distribution.student.name} linked to{" "}
                  {distribution.device.assetTag}
                </p>
              </div>

              <div className="border-b border-slate-800 px-5 py-4">
                <p className="font-medium">
                  Device handed over
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {distribution.handoverDate}
                </p>
              </div>

              {distribution.returnedDate ? (
                <div className="border-b border-slate-800 px-5 py-4">
                  <p className="font-medium">
                    Signed document returned
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {distribution.returnedDate}
                  </p>
                </div>
              ) : (
                <div className="border-b border-slate-800 px-5 py-4">
                  <p className="font-medium">
                    Awaiting signed-paper return
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Physical signature is still pending
                  </p>
                </div>
              )}

              {distribution.verifiedDate ? (
                <div className="px-5 py-4">
                  <p className="font-medium">
                    IT verification completed
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {distribution.verifiedDate}
                  </p>
                </div>
              ) : (
                <div className="px-5 py-4">
                  <p className="font-medium">
                    IT verification pending
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Verification cannot complete until the signed document returns
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