import type { ReactNode } from 'react';

export function LessonSectionCard({
  number,
  title,
  children,
  className = '',
}: {
  number?: number;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-xl border border-surface-border bg-white p-4 shadow-panel sm:p-5 ${className}`}
    >
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {number != null ? `${number}. ` : ''}
        {title}
      </h2>
      {children}
    </section>
  );
}
