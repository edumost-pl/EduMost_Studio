export interface BilingualTextProps {
  textPl: string | null | undefined;
  textUa: string | null | undefined;
  /** stack: PL on top, UA below (default). inline: PL · UA */
  variant?: 'stack' | 'inline' | 'compact';
  className?: string;
  plClassName?: string;
  uaClassName?: string;
}

/**
 * Displays educational content in fixed order: PL first, UA second.
 * See docs/language-architecture.md
 */
export function BilingualText({
  textPl,
  textUa,
  variant = 'stack',
  className = '',
  plClassName = 'text-slate-900',
  uaClassName = 'text-slate-500',
}: BilingualTextProps) {
  const pl = textPl?.trim();
  const ua = textUa?.trim();

  if (!pl && !ua) {
    return <span className="text-slate-300">—</span>;
  }

  if (variant === 'inline') {
    return (
      <span className={className}>
        {pl ? <span className={plClassName}>{pl}</span> : null}
        {pl && ua ? <span className="text-slate-300"> · </span> : null}
        {ua ? <span className={uaClassName}>{ua}</span> : null}
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={className}>
        {pl ? <div className={`text-sm font-medium ${plClassName}`}>{pl}</div> : null}
        {ua ? <div className={`text-xs ${uaClassName}`}>{ua}</div> : null}
      </div>
    );
  }

  return (
    <div className={`space-y-0.5 ${className}`}>
      {pl ? <div className={`font-medium leading-snug ${plClassName}`}>{pl}</div> : null}
      {ua ? <div className={`text-sm leading-snug ${uaClassName}`}>{ua}</div> : null}
    </div>
  );
}

export function BilingualBulletList({
  textPl,
  textUa,
  labelPl = 'PL',
  labelUa = 'UA',
}: {
  textPl: string | null | undefined;
  textUa: string | null | undefined;
  labelPl?: string;
  labelUa?: string;
}) {
  const renderList = (text: string | null | undefined) => {
    if (!text?.trim()) return null;
    const items = text
      .split('\n')
      .map((line) => line.replace(/^[•\-\*]\s*/, '').trim())
      .filter(Boolean);
    if (items.length === 0) return <p className="text-sm text-slate-600">{text}</p>;
    return (
      <ul className="list-disc space-y-1 pl-4 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-3">
      {textPl ? (
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {labelPl}
          </div>
          {renderList(textPl)}
        </div>
      ) : null}
      {textUa ? (
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {labelUa}
          </div>
          {renderList(textUa)}
        </div>
      ) : null}
    </div>
  );
}

export function parseTerminology(
  terminology: string | null | undefined,
): string[] {
  if (!terminology?.trim()) return [];
  return terminology
    .split(';')
    .map((term) => term.trim())
    .filter(Boolean);
}

export function TermTags({
  terms,
  className = '',
}: {
  terms: string[];
  className?: string;
}) {
  if (terms.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {terms.map((term) => (
        <span
          key={term}
          className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700"
        >
          {term}
        </span>
      ))}
    </div>
  );
}
