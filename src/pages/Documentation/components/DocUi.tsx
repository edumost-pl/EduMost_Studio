import type { ReactNode } from 'react';

export function DocSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 border-b border-surface-border pb-10 last:border-0">
      <h2 className="mb-4 text-xl font-semibold text-slate-900">{title}</h2>
      <div className="space-y-4 text-sm leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}

export function DocTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-surface-border">
      <table className="min-w-full divide-y divide-surface-border text-left text-sm">
        <thead className="bg-surface-muted">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-3 font-semibold text-slate-600"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border bg-white">
          {rows.map((row, index) => (
            <tr key={index} className="align-top">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DocPre({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-surface-border bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
      {children}
    </pre>
  );
}

export function DocCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-surface-border bg-white p-4 shadow-panel">
      <h3 className="mb-2 font-semibold text-slate-900">{title}</h3>
      <div className="text-sm text-slate-700">{children}</div>
    </div>
  );
}
