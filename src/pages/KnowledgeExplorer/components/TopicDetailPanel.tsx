import { useEffect, useState } from 'react';
import {
  BilingualBulletList,
  BilingualText,
  parseTerminology,
  TermTags,
} from '@/components/content/BilingualText';
import { useNavigation } from '@/context/NavigationContext';
import { useI18n } from '@/i18n';
import { fetchTopicDetail } from '@/services/api';
import type { TopicDetail } from '@/types/database';

export function TopicDetailPanel({ topicId }: { topicId: number | null }) {
  const { t } = useI18n();
  const nav = useNavigation();
  const [detail, setDetail] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!topicId) {
      setDetail(null);
      return;
    }
    setLoading(true);
    fetchTopicDetail(topicId)
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [topicId, nav.explorerRefreshKey]);

  if (!topicId) {
    return (
      <aside className="flex w-80 shrink-0 items-center justify-center border-l border-surface-border bg-white p-6 text-sm text-slate-400">
        {t('common.noResults')}
      </aside>
    );
  }

  if (loading || !detail) {
    return (
      <aside className="flex w-80 shrink-0 items-center justify-center border-l border-surface-border bg-white p-6 text-sm text-slate-400">
        {t('common.loading')}
      </aside>
    );
  }

  const related = (detail.relations ?? []).filter(
    (r) => r.relation_type === 'RELATED',
  );
  const lessons = detail.lessons ?? [];
  const terms = parseTerminology(detail.terminology_ua || detail.terminology_pl);

  const openLesson = (lessonId?: number) => {
    const targetId =
      lessonId ??
      lessons.find((lesson) => lesson.is_primary === 1)?.lesson_id ??
      lessons[0]?.lesson_id;
    if (targetId) {
      nav.setEditingLessonId(targetId);
    }
  };

  return (
    <aside className="flex w-80 shrink-0 flex-col overflow-y-auto border-l border-surface-border bg-white">
      <div className="border-b border-surface-border p-5">
        <div className="mb-3 inline-flex rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand-700">
          {t('topicCard.label')}
        </div>
        <BilingualText
          textPl={detail.name_pl}
          textUa={detail.name_ua}
          plClassName="text-lg font-semibold text-slate-900"
          uaClassName="text-sm text-slate-500"
        />
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
          <span>
            {t('table.class')}: {detail.curriculum?.[0]?.school_class ?? '—'}
          </span>
          <span>·</span>
          <span>
            {t('table.section')}: {detail.section_name_ua}
          </span>
          <span>·</span>
          <span>
            {t('table.lessons')}: {lessons.length}
          </span>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {detail.description_pl || detail.description_ua ? (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t('topicCard.shortDescription')}
            </h3>
            <BilingualBulletList
              textPl={detail.description_pl}
              textUa={detail.description_ua}
            />
          </section>
        ) : null}

        {detail.prerequisites_pl || detail.prerequisites_ua ? (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t('topicCard.prerequisites')}
            </h3>
            <BilingualBulletList
              textPl={detail.prerequisites_pl}
              textUa={detail.prerequisites_ua}
            />
          </section>
        ) : null}

        {detail.outcomes_pl || detail.outcomes_ua ? (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t('topicCard.outcomes')}
            </h3>
            <BilingualBulletList
              textPl={detail.outcomes_pl}
              textUa={detail.outcomes_ua}
            />
          </section>
        ) : null}

        {terms.length > 0 ? (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t('topicCard.keyTerms')}
            </h3>
            <TermTags terms={terms} />
          </section>
        ) : null}

        {related.length > 0 ? (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t('topicCard.relatedTopics')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {related.map((rel) => (
                <span
                  key={rel.id}
                  className="rounded-lg bg-surface-muted px-2 py-1 font-mono text-xs text-brand-700"
                >
                  {rel.related_code}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {lessons.length > 0 ? (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t('topicCard.lessonsForTopic')}
            </h3>
            <ul className="space-y-2">
              {lessons.map((lesson) => (
                <li key={lesson.id}>
                  <button
                    type="button"
                    onClick={() => openLesson(lesson.lesson_id)}
                    className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-brand-50"
                  >
                    <div className="font-mono text-xs font-semibold text-brand-700">
                      {lesson.lesson_code}
                    </div>
                    <BilingualText
                      textPl={lesson.lesson_title_pl}
                      textUa={lesson.lesson_title_ua}
                      variant="compact"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section className="rounded-xl border border-dashed border-surface-border bg-surface-muted/40 px-4 py-6 text-center">
            <p className="text-sm text-slate-500">{t('editor.noLessonsYet')}</p>
            <button
              type="button"
              onClick={() => nav.startCreateLesson(topicId)}
              className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              {t('action.newLesson')}
            </button>
          </section>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-2 border-t border-surface-border p-4">
        <button
          type="button"
          onClick={() => topicId && nav.setEditingTopicId(topicId)}
          className="rounded-xl border border-surface-border px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ✏️ {t('action.editTopic')}
        </button>
        {lessons.length === 0 ? (
          <button
            type="button"
            onClick={() => nav.startCreateLesson(topicId)}
            className="rounded-xl border border-brand-600 px-4 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
          >
            {t('action.newLesson')}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => openLesson()}
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            {t('action.openLesson')} →
          </button>
        )}
      </div>
    </aside>
  );
}
