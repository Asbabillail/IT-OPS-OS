import { AppSidebar } from "@/components/app-sidebar";

export default function ReportsPage() {
  return (
    <main className="flex min-h-screen bg-slate-950 text-white">
      <AppSidebar />

      <section className="flex-1 px-8 py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <header>
            <p className="text-sm font-medium text-slate-500">
              Operational Intelligence
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Reports
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Phase 1 operational reporting and workflow summaries.
            </p>
          </header>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">
              Reporting workspace
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Report queries will be connected after the server-side data layer is in place.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
