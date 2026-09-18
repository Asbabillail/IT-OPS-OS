import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";
import {
  appleCareClaims,
  getDeviceBySerial,
} from "@/data/domain";

export default function AppleCarePage() {
  return (
    <main className="flex min-h-screen bg-slate-950 text-white">
      <AppSidebar />

      <section className="flex-1 px-8 py-8">
        <div className="mx-auto max-w-7xl">
          <header>
            <p className="text-sm font-medium text-slate-500">
              Coverage & Claims
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              AppleCare
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Track AppleCare coverage, linked repairs, claim processing,
              and service outcomes.
            </p>
          </header>

          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                AppleCare Claims
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Synthetic Phase 1 workflow data
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <div className="hidden grid-cols-[1fr_1fr_1fr_1fr_0.9fr_1fr_1.2fr_auto] gap-4 border-b border-slate-800 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
                <span>Claim ID</span>
                <span>Asset Tag</span>
                <span>Serial</span>
                <span>Repair Case</span>
                <span>Coverage</span>
                <span>Claim Status</span>
                <span>Issue</span>
                <span>Claim</span>
              </div>

              {appleCareClaims.map((claim) => {
                const device = getDeviceBySerial(claim.deviceSerial);

                if (!device) {
                  return null;
                }

                return (
                  <article
                    key={claim.id}
                    className="grid gap-4 border-b border-slate-800 px-5 py-4 last:border-b-0 lg:grid-cols-[1fr_1fr_1fr_1fr_0.9fr_1fr_1.2fr_auto] lg:items-center"
                  >
                    <p className="text-sm text-slate-300">
                      {claim.id}
                    </p>

                    <p className="font-medium text-white">
                      {device.assetTag}
                    </p>

                    <p className="text-sm text-slate-300">
                      {device.serial}
                    </p>

                    <p className="text-sm text-slate-300">
                      {claim.repairId}
                    </p>

                    <p className="text-sm text-slate-300">
                      {claim.coverage}
                    </p>

                    <p className="text-sm text-slate-300">
                      {claim.claimStatus}
                    </p>

                    <p className="text-sm text-slate-300">
                      {claim.issue}
                    </p>

                    <Link
                      href={`/applecare/${claim.id}`}
                      className="inline-flex justify-self-start rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 lg:justify-self-end"
                    >
                      Open Claim
                    </Link>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}