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
          </div>
        </div>
      </section>
    </main>
  );
}