import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";
import { listDeviceDirectory } from "@/lib/repositories/devices";

export const dynamic = "force-dynamic";

export default async function DevicesPage() {
  const directory = await listDeviceDirectory();

  return (
    <main className="flex min-h-screen bg-slate-950 text-white">
      <AppSidebar />

      <section className="flex-1 px-8 py-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Devices
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                iPad Inventory
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Browse the live Phase 1 device fleet and open Device 360°
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
            aria-labelledby="device-directory"
            className="mt-8"
          >
            <div className="mb-4">
              <h2
                id="device-directory"
                className="text-lg font-semibold"
              >
                Device Directory
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Live Phase 1 Supabase data
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <div className="hidden grid-cols-[1fr_1fr_0.8fr_0.8fr_0.9fr_1fr_auto] gap-4 border-b border-slate-800 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
                <span>Asset Tag</span>
                <span>Serial</span>
                <span>Model</span>
                <span>Storage</span>
                <span>Status</span>
                <span>Assigned To</span>
                <span>Profile</span>
              </div>

              {directory.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm font-medium text-slate-300">
                    No device records found
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Device records will appear here once they are added to
                    Supabase.
                  </p>
                </div>
              ) : (
                directory.map(({ device, assignedTo }) => (
                  <article
                    key={device.serial}
                    className="grid gap-4 border-b border-slate-800 px-5 py-4 last:border-b-0 lg:grid-cols-[1fr_1fr_0.8fr_0.8fr_0.9fr_1fr_auto] lg:items-center"
                  >
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 lg:hidden">
                        Asset Tag
                      </p>

                      <p className="mt-1 font-medium text-white lg:mt-0">
                        {device.assetTag}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 lg:hidden">
                        Serial
                      </p>

                      <p className="mt-1 text-sm text-slate-300 lg:mt-0">
                        {device.serial}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 lg:hidden">
                        Model
                      </p>

                      <p className="mt-1 text-sm text-slate-300 lg:mt-0">
                        {device.model}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 lg:hidden">
                        Storage
                      </p>

                      <p className="mt-1 text-sm text-slate-300 lg:mt-0">
                        {device.storage}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 lg:hidden">
                        Status
                      </p>

                      <p className="mt-1 text-sm text-slate-300 lg:mt-0">
                        {device.status}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 lg:hidden">
                        Assigned To
                      </p>

                      <p className="mt-1 text-sm text-slate-300 lg:mt-0">
                        {assignedTo ?? "—"}
                      </p>
                    </div>

                    <Link
                      href={`/devices/${device.serial}`}
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
