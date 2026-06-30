import {
  BilingualText,
  parseTerminology,
  TermTags,
} from '@/components/content/BilingualText';
import { useI18n } from '@/i18n';
import type { LessonDetail } from '@/types/database';
import type { LessonFormData } from '../types';
import { LessonResourcesList } from './LessonResourcesList';
import { LessonSectionCard } from './LessonSectionCard';
import { LessonTopicsList } from './LessonTopicsList';

function ViewBilingualBlock({
  textPl,
  textUa,
}: {
  textPl: string;
  textUa: string;
}) {
  const { t } = useI18n();
  const hasPl = Boolean(textPl?.trim());
  const hasUa = Boolean(textUa?.trim());

  if (!hasPl && !hasUa) {
    return <p className="text-sm text-slate-300">—</p>;
  }

  return (
    <div className="space-y-4">
      {hasPl ? (
        <div>
          <div className="mb-2 text-xs font-semibold text-brand-700">{t('content.labelPl')}</div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {textPl}
          </div>
        </div>
      ) : null}
      {hasUa ? (
        <div>
          <div className="mb-2 text-xs font-semibold text-brand-700">{t('content.labelUa')}</div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
            {textUa}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="shrink-0 text-xs font-medium text-slate-500 sm:w-36">{label}</dt>
      <dd className="min-w-0 text-sm text-slate-800">{value}</dd>
    </div>
  );
}

export function LessonViewDocument({
  detail,
  form,
}: {
  detail: LessonDetail;
  form: LessonFormData;
}) {
  const { t } = useI18n();
  const primaryTopic =
    detail.topics?.find((topic) => topic.is_primary === 1) ?? detail.topics?.[0];
  const topics = detail.topics ?? [];
  const resources = detail.resources ?? [];
  const termsPl = parseTerminology(form.terminology_pl);
  const termsUa = parseTerminology(form.terminology_ua);
  const terms = [...new Set([...termsPl, ...termsUa])];

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
      <div className="min-w-0 space-y-4 lg:col-span-3">
        <LessonSectionCard number={1} title={t('lessonStudio.basicInfo')}>
          <dl className="space-y-3">
            <MetaRow label={t('lessonStudio.lessonCode')} value={form.code} />
            {primaryTopic ? (
              <div>
                <dt className="mb-1 text-xs font-medium text-slate-500">
                  {t('lessonStudio.primaryTopic')}
                </dt>
                <dd>
                  <div className="font-mono text-xs font-semibold text-brand-700">
                    {primaryTopic.topic_code}
                  </div>
                  <BilingualText
                    textPl={primaryTopic.topic_name_pl}
                    textUa={primaryTopic.topic_name_ua}
                    variant="compact"
                  />
                </dd>
              </div>
            ) : null}
            {primaryTopic ? (
              <MetaRow label={t('lessonStudio.section')} value={primaryTopic.section_name_ua} />
            ) : null}
            <MetaRow
              label={t('table.class')}
              value={`${form.school_class} ${t('common.class')}`}
            />
            <MetaRow label={t('lessonStudio.lessonType')} value={form.lesson_type} />
            <MetaRow
              label={t('lessonStudio.duration')}
              value={`${form.duration ?? '—'} ${t('lessonStudio.minutes')}`}
            />
            <MetaRow label={t('lessonStudio.status')} value={form.status} />
            {form.author ? (
              <MetaRow label={t('lessonStudio.author')} value={form.author} />
            ) : null}
          </dl>
          {topics.length > 0 ? (
            <div className="mt-4 border-t border-surface-border pt-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t('lessonStudio.relatedTopics')}
              </h3>
              <LessonTopicsList topics={topics} />
            </div>
          ) : null}
        </LessonSectionCard>

        <LessonSectionCard number={2} title={t('lessonStudio.goal')}>
          <ViewBilingualBlock textPl={form.goal_pl} textUa={form.goal_ua} />
        </LessonSectionCard>

        <LessonSectionCard number={3} title={t('topicCard.prerequisites')}>
          <ViewBilingualBlock
            textPl={form.learning_results_pl}
            textUa={form.learning_results_ua}
          />
        </LessonSectionCard>

        <LessonSectionCard title={t('topicCard.outcomes')}>
          <ViewBilingualBlock textPl={form.assessment_pl} textUa={form.assessment_ua} />
        </LessonSectionCard>
      </div>

      <div className="min-w-0 space-y-4 lg:col-span-5">
        <LessonSectionCard number={6} title={t('lessonStudio.scenario')}>
          <ViewBilingualBlock textPl={form.scenario_pl} textUa={form.scenario_ua} />
        </LessonSectionCard>
      </div>

      <div className="min-w-0 space-y-4 lg:col-span-4">
        <LessonSectionCard number={4} title={t('lessonStudio.materials')}>
          <LessonResourcesList resources={resources} />
        </LessonSectionCard>

        <LessonSectionCard number={5} title={t('topicCard.keyTerms')}>
          {terms.length > 0 ? <TermTags terms={terms} /> : <p className="text-sm text-slate-300">—</p>}
        </LessonSectionCard>

        <LessonSectionCard number={7} title={t('lessonStudio.tabHomework')}>
          <ViewBilingualBlock textPl={form.homework_pl} textUa={form.homework_ua} />
        </LessonSectionCard>

        <LessonSectionCard number={8} title={t('lessonStudio.teacherNotes')}>
          <ViewBilingualBlock textPl={form.teacher_notes_pl} textUa={form.teacher_notes_ua} />
        </LessonSectionCard>
      </div>
    </div>
  );
}
