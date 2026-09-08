import Link from "next/link";
const navigationItems = [
  "Dashboard",
  "Global Search",
  "Students",
  "Faculty",
  "iPad Inventory",
  "Distribution",
  "BYOD",
  "Repairs",
  "AppleCare",
  "Returns",
  "Releases",
  "Documents",
  "Reports",
  "Administration",
] as const;

export function AppSidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col overflow-y-auto border-r border-slate-800 bg-slate-950 px-5 py-6 text-slate-100">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Yenepoya International Schools
        </p>

        <h2 className="mt-2 text-xl font-bold tracking-tight">
          IT OPS OS
        </h2>
      </div>

      <nav aria-label="Primary navigation">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item}>
              {item === "Students" ? (
                <Link
                  href="/students"
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
                >
                  {item}
                </Link>
              ) : item === "Faculty" ? (
                <Link
                  href="/faculty"
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
                >
                  {item}
                </Link>
              ) : item === "iPad Inventory" ? (
                <Link
                  href="/devices"
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
                >
                  {item}
                </Link>
              ) : (
                <button
                  type="button"
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
                >
                  {item}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
