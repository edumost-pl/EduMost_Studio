import { CurriculumBreadcrumbs } from '@/components/layout/CurriculumBreadcrumbs';
import { BilingualText } from '@/components/content/BilingualText';
import { useCurriculumNavigation } from '@/hooks/useCurriculumNavigation';
import { useI18n } from '@/i18n';
import type { TopicDetail } from '@/types/database';
import type { TopicFormData } from '../types';

function formatUpdatedAt(value: string | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TopicEditorHeader({
  detail,
  form,
  isCreate,
  subjectId,
  subjectNameUa,
  sectionNameUa,
  schoolClass,
  lessonsCount,
  onBack,
  onNewLesson,
  isDirty,
}: {
  detail: TopicDetail | null;
  form: TopicFormData;
  isCreate: boolean;
  subjectId: number | null;
  subjectNameUa: string;
  sectionNameUa: string;
  schoolClass: number | null | undefined;
  lessonsCount: number;
  onBack: () => void;
  onNewLesson?: () => void;
  isDirty: boolean;
}) {
  const { t } = useI18n();
  const {
    goToSubject,
    goToClass,
    goToSection,
  } = useCurriculumNavigation();

  const topicLabel = isCreate
    ? t('editor.createTopic')
    : `${form.name_pl || '—'} (${form.code})`;

  const breadcrumbItems = [];

  if (subjectId) {
    breadcrumbItems.push({
      label: subjectNameUa,
      onClick: () => goToSubject(subjectId),
    });
  }

  if (schoolClass && subjectId) {
    breadcrumbItems.push({
      label: `${schoolClass} ${t('common.class')}`,
      onClick: () => goToClass(subjectId, schoolClass),
    });
  }

  if (form.section_id > 0 && schoolClass && subjectId) {
    breadcrumbItems.push({
      label: sectionNameUa,
      onClick: () => goToSection(subjectId, schoolClass, form.section_id),
    });
  }

  if (!isCreate && detail) {
    breadcrumbItems.push({ label: topicLabel });
  } else {
    breadcrumbItems.push({ label: topicLabel });
  }

  return (
    <div className="border-b border-surface-border bg-white px-6 py-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <CurriculumBreadcrumbs items={breadcrumbItems} />
        <div className="flex shrink-0 items-center gap-2">
          {onNewLesson ? (
            <button
              type="button"
              onClick={onNewLesson}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              {t('action.newLesson')}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-surface-border px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            ← {t('editor.backToList')}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand-700">
            {isCreate ? t('editor.createTopic') : t('topicCard.label')}
          </div>
          <div className="font-mono text-sm font-semibold text-brand-700">{form.code}</div>
          <div className="mt-2">
            <BilingualText
              textPl={form.name_pl || '—'}
              textUa={form.name_ua || '—'}
              plClassName="text-2xl font-semibold text-slate-900"
              uaClassName="text-base text-slate-500"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
            <span>
              {t('table.class')}: {schoolClass ?? '—'}
            </span>
            <span>·</span>
            <span>
              {t('table.section')}: {sectionNameUa}
            </span>
            {!isCreate ? (
              <>
                <span>·</span>
                <span>
                  {t('table.lessons')}: {lessonsCount}
                </span>
              </>
            ) : null}
            <span>·</span>
            <span>
              {t('editor.status')}:{' '}
              <span className={form.is_active ? 'text-emerald-600' : 'text-slate-400'}>
                ● {form.is_active ? t('editor.statusActive') : t('editor.statusInactive')}
              </span>
            </span>
          </div>
          {!isCreate && detail ? (
            <p className="mt-2 text-xs text-slate-400">
              {t('editor.lastUpdated')}: {formatUpdatedAt(detail.updated_at)}
            </p>
          ) : null}
          {isDirty ? (
            <p className="mt-1 text-xs font-medium text-amber-600">{t('editor.unsavedChanges')}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
