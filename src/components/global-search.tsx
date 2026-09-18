"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { searchRecords } from "@/data/search-records";

export function GlobalSearch() {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return searchRecords.filter((record) => {
      const searchableValues = [
        record.title,
        record.subtitle,
        ...record.identifiers,
      ];

      return searchableValues.some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      );
    });
  }, [normalizedQuery]);

  return (
    <div>
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
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search people, IDs, emails, serials, asset tags, or workflows..."
        autoComplete="off"
        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-slate-600"
      />

      {normalizedQuery && (
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          {results.length > 0 ? (
            <ul>
              {results.map((record) => (
                <li
                  key={record.id}
                  className="border-b border-slate-800 last:border-b-0"
                >
                  <Link
                    href={record.href}
                    className="block px-4 py-3 transition hover:bg-slate-800/60"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-white">
                        {record.title}
                      </p>

                      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {record.type}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {record.subtitle}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-sm text-slate-500">
              No matching records found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}