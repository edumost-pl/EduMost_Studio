import type { ReactNode } from 'react';

const fieldClass =
  'w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100';

export function ReferenceModal({
  title,
  children,
  onClose,
  onSave,
  saving,
  saveLabel,
  cancelLabel,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
  saveLabel: string;
  cancelLabel: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-surface-border bg-white shadow-xl"
      >
        <div className="border-b border-surface-border px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        </div>
        <div className="space-y-4 px-6 py-5">{children}</div>
        <div className="flex justify-end gap-3 border-t border-surface-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-surface-border px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? '...' : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReferenceField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}

export function ReferenceInput({
  value,
  onChange,
  type = 'text',
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${fieldClass} ${className}`}
    />
  );
}

export function ActiveBadge({
  active,
  yesLabel,
  noLabel,
}: {
  active: boolean;
  yesLabel: string;
  noLabel: string;
}) {
  return (
    <span
      className={[
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500',
      ].join(' ')}
    >
      {active ? yesLabel : noLabel}
    </span>
  );
}

export function ReferenceToolbar({
  newLabel,
  onNew,
  onExport,
  importLabel,
  busy,
}: {
  newLabel: string;
  onNew: () => void;
  onExport: () => void;
  importLabel: string;
  busy?: boolean;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onNew}
        disabled={busy}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {newLabel}
      </button>
      <button
        type="button"
        onClick={onExport}
        disabled={busy}
        className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        📥 Excel
      </button>
      <button
        type="button"
        disabled
        title={importLabel}
        className="cursor-not-allowed rounded-lg border border-dashed border-surface-border px-4 py-2 text-sm font-medium text-slate-400"
      >
        📤 {importLabel}
      </button>
    </div>
  );
}

export function ReferenceTable({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-surface-border bg-white shadow-panel">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-muted text-xs uppercase tracking-wide text-slate-500">
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function ReferenceRowActions({
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
}: {
  onEdit: () => void;
  onDelete: () => void;
  editLabel: string;
  deleteLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onEdit}
        className="rounded-lg border border-surface-border px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        {editLabel}
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
      >
        {deleteLabel}
      </button>
    </div>
  );
}

export { fieldClass };
