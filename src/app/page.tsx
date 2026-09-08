import { AppSidebar } from "@/components/app-sidebar";

export default function Home() {
  return (
    <main className="flex min-h-screen bg-slate-950 text-white">
      <AppSidebar />

      <section className="flex-1 bg-slate-950 px-8 py-8">
        <div className="mx-auto max-w-7xl">
          <header>
            <p className="text-sm font-medium text-slate-500">
              Command Center
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Monitor iPad operations, find records, and resolve work requiring attention.
            </p>
          </header>

          <div className="mt-8">
            <label
              htmlFor="global-search"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Global Search
            </label>

            <input
              id="global-search"
              name="global-search"
              type="search"
              placeholder="Search student, faculty, ID, email, serial number, or asset tag..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-slate-600"
            />
                      <section
            aria-labelledby="operational-overview"
            className="mt-8"
          >
            <div className="mb-4">
              <h2
                id="operational-overview"
                className="text-lg font-semibold text-white"
              >
                Operational Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Synthetic Phase 1 development data
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  Students
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  248
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  Assigned iPads
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  216
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  Available iPads
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  18
                </p>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  In Repair
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  7
                </p>
              </article>
            </div>
          </section>
                    <section
            aria-labelledby="action-required"
            className="mt-8"
          >
            <div className="mb-4">
              <h2
                id="action-required"
                className="text-lg font-semibold text-white"
              >
                Action Required
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Synthetic workflow queue
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-slate-800 px-5 py-4">
                <div>
                  <p className="font-medium text-white">
                    Pending physical signatures
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Distribution forms awaiting signed-paper return
                  </p>
                </div>

                <span className="rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-200">
                  12
                </span>
              </div>

              <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-slate-800 px-5 py-4">
                <div>
                  <p className="font-medium text-white">
                    Pending verification
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Signed documents waiting for IT verification
                  </p>
                </div>

                <span className="rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-200">
                  6
                </span>
              </div>

              <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4">
                <div>
                  <p className="font-medium text-white">
                    Open repair cases
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Devices currently moving through the repair workflow
                  </p>
                </div>

                <span className="rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-200">
                  7
                </span>
              </div>
            </div>
          </section>
                    <section
            aria-labelledby="recent-activity"
            className="mt-8 pb-8"
          >
            <div className="mb-4">
              <h2
                id="recent-activity"
                className="text-lg font-semibold text-white"
              >
                Recent Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Synthetic lifecycle events
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <div className="border-b border-slate-800 px-5 py-4">
                <p className="font-medium text-white">
                  Device assigned to student
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  STU-2026-041 · iPad serial DMQR92KX
                </p>
              </div>

              <div className="border-b border-slate-800 px-5 py-4">
                <p className="font-medium text-white">
                  Signed distribution form verified
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Document verification completed by IT
                </p>
              </div>

              <div className="px-5 py-4">
                <p className="font-medium text-white">
                  Repair case opened
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Asset YIS-PAD-0412 moved to In Repair
                </p>
              </div>
            </div>
          </section>
          </div>
        </div>
      </section>
    </main>
  );
}