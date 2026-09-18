"use client";

import { Letterhead, LetterheadFooter } from "./letterhead";

type FormWithLetterheadProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function FormWithLetterhead({
  title,
  description,
  children,
}: FormWithLetterheadProps) {
  return (
    <div className="space-y-6">
      {/* Print Preview Container */}
      <div className="rounded-xl border border-slate-800 bg-white text-slate-900 shadow-lg overflow-hidden print:shadow-none print:border-0 print:rounded-0">
        <Letterhead />

        {/* Form Content */}
        <div className="px-8 py-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
          <p className="text-sm text-slate-600 mb-6">{description}</p>

          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            {children}
          </div>
        </div>

        <LetterheadFooter />
      </div>

      {/* Print Instructions */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 print:hidden">
        <p className="text-sm text-blue-900">
          💡 <strong>Tip:</strong> Use Cmd+P (Mac) or Ctrl+P (Windows) to print this form with letterhead
        </p>
      </div>
    </div>
  );
}
