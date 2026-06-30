export interface BilingualFieldGroupProps {
  labelPl?: string;
  labelUa?: string;
  valuePl: string;
  valueUa: string;
  onChangePl?: (value: string) => void;
  onChangeUa?: (value: string) => void;
  variant?: 'input' | 'textarea';
  rows?: number;
  maxLength?: number;
  placeholderPl?: string;
  placeholderUa?: string;
  required?: boolean;
  readOnly?: boolean;
}

function CharCounter({ value, maxLength }: { value: string; maxLength?: number }) {
  if (!maxLength) return null;
  return (
    <span className="text-xs tabular-nums text-slate-400">
      {value.length} / {maxLength}
    </span>
  );
}

const fieldClass =
  'w-full min-w-0 rounded-lg border border-surface-border bg-surface-muted/40 px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100';

const labelClass = 'text-xs font-semibold text-brand-700';

/** Bilingual editor fields: Польська → Українська. */
export function BilingualFieldGroup({
  labelPl = 'Польська',
  labelUa = 'Українська',
  valuePl,
  valueUa,
  onChangePl,
  onChangeUa,
  variant = 'textarea',
  rows = 4,
  maxLength,
  placeholderPl,
  placeholderUa,
  required,
  readOnly = false,
}: BilingualFieldGroupProps) {
  return (
    <div className="space-y-4">
      <div className="min-w-0">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label className={labelClass}>
            {labelPl}
            {required ? <span className="text-red-500"> *</span> : null}
          </label>
          {!readOnly ? <CharCounter value={valuePl} maxLength={maxLength} /> : null}
        </div>
        {variant === 'input' ? (
          <input
            type="text"
            value={valuePl}
            readOnly={readOnly}
            onChange={(e) => onChangePl?.(e.target.value)}
            maxLength={maxLength}
            placeholder={placeholderPl}
            className={`${fieldClass}${readOnly ? ' bg-surface-muted text-slate-600' : ''}`}
          />
        ) : (
          <textarea
            value={valuePl}
            readOnly={readOnly}
            onChange={(e) => onChangePl?.(e.target.value)}
            rows={rows}
            maxLength={maxLength}
            placeholder={placeholderPl}
            className={`${fieldClass} resize-y${readOnly ? ' bg-surface-muted text-slate-600' : ''}`}
          />
        )}
      </div>

      <div className="min-w-0">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label className={labelClass}>
            {labelUa}
            {required ? <span className="text-red-500"> *</span> : null}
          </label>
          {!readOnly ? <CharCounter value={valueUa} maxLength={maxLength} /> : null}
        </div>
        {variant === 'input' ? (
          <input
            type="text"
            value={valueUa}
            readOnly={readOnly}
            onChange={(e) => onChangeUa?.(e.target.value)}
            maxLength={maxLength}
            placeholder={placeholderUa}
            className={`${fieldClass}${readOnly ? ' bg-surface-muted text-slate-600' : ''}`}
          />
        ) : (
          <textarea
            value={valueUa}
            readOnly={readOnly}
            onChange={(e) => onChangeUa?.(e.target.value)}
            rows={rows}
            maxLength={maxLength}
            placeholder={placeholderUa}
            className={`${fieldClass} resize-y${readOnly ? ' bg-surface-muted text-slate-600' : ''}`}
          />
        )}
      </div>
    </div>
  );
}
