import { useI18n } from '@/i18n';

export function PaginationBar({
  page,
  pageSize,
  hasMore,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const { t } = useI18n();
  const pages = Array.from({ length: Math.max(page, hasMore ? page + 1 : page) }, (_, i) => i + 1).slice(0, 5);

  return (
    <div className="flex items-center justify-between border-t border-surface-border bg-white px-4 py-3">
      <div className="flex items-center gap-1">
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={[
              'flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm',
              p === page
                ? 'bg-brand-600 font-medium text-white'
                : 'text-slate-600 hover:bg-slate-100',
            ].join(' ')}
          >
            {p}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span>{t('explorer.rowsPerPage')}:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-lg border border-surface-border bg-white px-2 py-1 text-sm outline-none focus:border-brand-500"
        >
          {[10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
