"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationItem = {
  label: string;
  href: string | null;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/",
  },
  {
    label: "Global Search",
    href: "/#global-search",
  },
  {
    label: "Students",
    href: "/students",
  },
  {
    label: "Faculty",
    href: "/faculty",
  },
  {
    label: "iPad Inventory",
    href: "/devices",
  },
  {
    label: "Distribution",
    href: "/distribution",
  },
  {
    label: "BYOD",
    href: "/byod",
  },
  {
    label: "Repairs",
    href: "/repairs",
  },
  {
    label: "AppleCare",
    href: "/applecare",
  },
  {
    label: "Returns",
    href: null,
  },
  {
    label: "Releases",
    href: null,
  },
  {
    label: "Documents",
    href: null,
  },
  {
    label: "Reports",
    href: null,
  },
  {
    label: "Administration",
    href: null,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 h-screen w-80 shrink-0 overflow-y-auto border-r border-slate-800 bg-slate-950 px-6 py-8 text-white">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Yenepoya International
          <br />
          Schools
        </p>

        <p className="mt-3 text-2xl font-bold tracking-tight">
          IT OPS OS
        </p>
      </div>

      <nav
        aria-label="Primary navigation"
        className="mt-12"
      >
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href !== null &&
                  item.href !== "/#global-search" &&
                  pathname.startsWith(item.href);

            return (
              <li key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={[
                      "block w-full rounded-lg px-3 py-2 text-left text-sm transition",
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-300 hover:bg-slate-900 hover:text-white",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
                  >
                    {item.label}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}