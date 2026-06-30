import { useI18n } from '@/i18n';

export function SequenceNav({
  prev,
  next,
  prevLabel,
  nextLabel,
  onPrev,
  onNext,
}: {
  prev?: { code: string; name: string } | null;
  next?: { code: string; name: string } | null;
  prevLabel: string;
  nextLabel: string;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  if (!prev && !next) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border bg-surface-muted/50 px-6 py-2">
      {prev && onPrev ? (
        <button
          type="button"
          onClick={onPrev}
          className="cursor-pointer rounded-lg border border-surface-border bg-white px-3 py-1.5 text-sm text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-700"
          title={`${prev.code}: ${prev.name}`}
        >
          ← {prevLabel}
          <span className="ml-1 hidden text-slate-400 sm:inline">({prev.code})</span>
        </button>
      ) : (
        <span />
      )}
      {next && onNext ? (
        <button
          type="button"
          onClick={onNext}
          className="cursor-pointer rounded-lg border border-surface-border bg-white px-3 py-1.5 text-sm text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-700"
          title={`${next.code}: ${next.name}`}
        >
          {nextLabel}
          <span className="mr-1 hidden text-slate-400 sm:inline">({next.code})</span> →
        </button>
      ) : null}
    </div>
  );
}

export function TopicSequenceNav(props: {
  prev?: { code: string; name: string } | null;
  next?: { code: string; name: string } | null;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const { t } = useI18n();
  return (
    <SequenceNav
      {...props}
      prevLabel={t('nav.prevTopic')}
      nextLabel={t('nav.nextTopic')}
    />
  );
}

export function LessonSequenceNav(props: {
  prev?: { code: string; name: string } | null;
  next?: { code: string; name: string } | null;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const { t } = useI18n();
  return (
    <SequenceNav
      {...props}
      prevLabel={t('nav.prevLesson')}
      nextLabel={t('nav.nextLesson')}
    />
  );
}
