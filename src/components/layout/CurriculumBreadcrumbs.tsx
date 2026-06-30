export type BreadcrumbItem = {
  label: string;
  onClick?: () => void;
};

export function CurriculumBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isLink = !isLast && Boolean(item.onClick);

        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
            {index > 0 ? <span className="text-slate-300">›</span> : null}
            {isLink ? (
              <button
                type="button"
                onClick={item.onClick}
                className="cursor-pointer text-slate-500 transition-colors hover:text-brand-600 hover:underline"
              >
                {item.label}
              </button>
            ) : (
              <span
                className={
                  isLast ? 'font-medium text-slate-800' : 'text-slate-500'
                }
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
