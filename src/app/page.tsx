import { AppSidebar } from "@/components/app-sidebar";

export default function Home() {
  return (
    <main className="flex min-h-screen bg-slate-950 text-white">
      <AppSidebar />

      <section className="flex flex-1 items-center justify-center px-6">
        <div className="text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            Yenepoya International Schools
          </p>

          <h1 className="text-5xl font-bold tracking-tight">
            IT OPS OS
          </h1>

          <p className="mt-4 text-lg text-slate-300">
            iPad Operations Command Center
          </p>

          <p className="mt-8 text-sm text-slate-500">
            Phase 1 Foundation
          </p>
        </div>
      </section>
    </main>
  );
}