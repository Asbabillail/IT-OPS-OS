import { AppSidebar } from "@/components/app-sidebar";
import { getPhase1Stats } from "@/lib/repositories/reports";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: number;
  subtext?: string;
}) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      {subtext && <p className="mt-2 text-xs text-slate-400">{subtext}</p>}
    </article>
  );
}

export default async function ReportsPage() {
  const stats = await getPhase1Stats();

  return (
    <main className="flex min-h-screen bg-slate-950 text-white">
      <AppSidebar />

      <section className="flex-1 px-8 py-8">
        <div className="mx-auto max-w-7xl space-y-8">
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

          <section>
            <h2 className="text-lg font-semibold mb-4">Device Inventory</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Devices" value={stats.devicesTotal} />
              <StatCard
                label="Available"
                value={stats.devicesAvailable}
                subtext="Ready for assignment"
              />
              <StatCard
                label="Assigned"
                value={stats.devicesAssigned}
                subtext="In active use"
              />
              <StatCard
                label="In Repair / Awaiting"
                value={stats.devicesInRepair}
                subtext="Service queue"
              />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Repair Activity</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <StatCard
                label="Open Repair Cases"
                value={stats.repairsOpen}
                subtext="In progress or awaiting parts"
              />
              <StatCard
                label="Completed Repairs"
                value={stats.repairsCompleted}
                subtext="Returned to service"
              />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Returns & Releases</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <StatCard
                label="Devices Returned"
                value={stats.returnsReceived}
                subtext="Inspection complete"
              />
              <StatCard
                label="Pending Inspection"
                value={stats.returnsPending}
                subtext="Awaiting review"
              />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">BYOD Enrollment</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <StatCard
                label="Enrolled Devices"
                value={stats.byodEnrolled}
                subtext="Compliant and active"
              />
              <StatCard
                label="Pending Enrollment"
                value={stats.byodPending}
                subtext="Awaiting compliance review"
              />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
