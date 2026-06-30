import { BilingualText } from '@/components/content/BilingualText';
import { useI18n } from '@/i18n';
import type { LessonTopicWithTopicView } from '@/types/database';

export function LessonTopicsList({ topics }: { topics: LessonTopicWithTopicView[] }) {
  const { t } = useI18n();

  if (topics.length === 0) {
    return <p className="text-sm text-slate-400">{t('common.noResults')}</p>;
  }

  return (
    <ul className="space-y-2">
      {topics.map((topic) => (
        <li
          key={topic.id}
          className="rounded-lg border border-surface-border bg-surface-muted px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-brand-700">
              {topic.topic_code}
            </span>
            {topic.is_primary === 1 ? (
              <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">
                primary
              </span>
            ) : null}
          </div>
          <BilingualText
            textPl={topic.topic_name_pl}
            textUa={topic.topic_name_ua}
            variant="compact"
          />
        </li>
      ))}
    </ul>
  );
}
