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
          </div>
        </div>
      </section>
    </main>
  );
}