import { CurriculumBreadcrumbs } from '@/components/layout/CurriculumBreadcrumbs';
import { BilingualText } from '@/components/content/BilingualText';
import { useCurriculumNavigation } from '@/hooks/useCurriculumNavigation';
import { useI18n } from '@/i18n';
import type { LessonDetail } from '@/types/database';
import type { LessonFormData } from '../types';

export type LessonStudioMode = 'view' | 'edit';

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

export function LessonEditorHeader({
  detail,
  form,
  mode,
  isCreate,
  createFromExplorer,
  onBack,
  onEdit,
  onPreview,
  onCancel,
  onSave,
  saving,
  isDirty,
}: {
  detail: LessonDetail | null;
  form: LessonFormData | null;
  mode: LessonStudioMode;
  isCreate?: boolean;
  createFromExplorer?: boolean;
  onBack: () => void;
  onEdit: () => void;
  onPreview: () => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  isDirty: boolean;
}) {
  const { t } = useI18n();
  const {
    goToSubject,
    goToClass,
    goToSection,
    goToTopicEditor,
    goToTopicLessons,
  } = useCurriculumNavigation();

  const primaryTopic =
    detail?.topics?.find((topic) => topic.is_primary === 1) ?? detail?.topics?.[0];

  const breadcrumbItems = [];

  if (detail?.subject_id) {
    breadcrumbItems.push({
      label: detail.subject_name_ua,
      onClick: () => goToSubject(detail.subject_id),
    });
  }

  if (form?.school_class && detail?.subject_id) {
    breadcrumbItems.push({
      label: `${form.school_class} ${t('common.class')}`,
      onClick: () => goToClass(detail.subject_id, form.school_class),
    });
  }

  if (primaryTopic && form?.school_class && detail?.subject_id) {
    breadcrumbItems.push({
      label: primaryTopic.section_name_ua,
      onClick: () =>
        goToSection(detail.subject_id, form.school_class, primaryTopic.section_id),
    });
  }

  if (primaryTopic && detail?.subject_id) {
    breadcrumbItems.push({
      label: `${primaryTopic.topic_name_pl} (${primaryTopic.topic_code})`,
      onClick: () => goToTopicEditor(primaryTopic.topic_id),
    });
    breadcrumbItems.push({
      label: t('topicCard.lessonsForTopic'),
      onClick: () => goToTopicLessons(primaryTopic.topic_id),
    });
  }

  breadcrumbItems.push({
    label: form?.code ?? t('editor.createLesson'),
  });

  return (
    <div className="shrink-0 border-b border-surface-border bg-white">
      <div className="px-4 py-3 sm:px-6">
        <div className="mb-3">
          <CurriculumBreadcrumbs items={breadcrumbItems} />
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-slate-900">{t('lessonStudio.title')}</h1>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-sm font-semibold text-brand-700">
                {form?.code ?? '—'}
              </span>
              {form ? (
                <BilingualText
                  textPl={form.title_pl}
                  textUa={form.title_ua}
                  variant="inline"
                  plClassName="text-base font-semibold text-slate-900"
                  uaClassName="text-sm text-slate-500"
                />
              ) : null}
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-surface-muted px-2.5 py-0.5">
                {t('lessonStudio.draftSaved')}: {formatUpdatedAt(detail?.updated_at)}
              </span>
              <span className="rounded-full bg-surface-muted px-2.5 py-0.5">
                {form?.status ?? 'Draft'}
              </span>
              <span className="rounded-full bg-surface-muted px-2.5 py-0.5">
                {form?.duration ?? '—'} {t('lessonStudio.minutes')}
              </span>
              {mode === 'view' ? (
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-brand-700">
                  {t('lessonStudio.viewMode')}
                </span>
              ) : (
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-amber-700">
                  {t('lessonStudio.editMode')}
                </span>
              )}
            </div>
            {mode === 'edit' && isDirty ? (
              <p className="mt-2 text-xs font-medium text-amber-600">
                {t('editor.unsavedChanges')}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {isCreate ? (
              <>
                <button
                  type="button"
                  onClick={onBack}
                  className="rounded-lg border border-surface-border px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  ←{' '}
                  {createFromExplorer ? t('editor.backToList') : t('editor.backToTopic')}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={saving}
                  className="rounded-lg border border-surface-border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {t('editor.cancel')}
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {saving ? t('common.loading') : t('action.save')}
                </button>
              </>
            ) : mode === 'view' ? (
              <>
                <button
                  type="button"
                  onClick={onBack}
                  className="rounded-lg border border-surface-border px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  ← {t('lessonStudio.back')}
                </button>
                <button
                  type="button"
                  onClick={onEdit}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  ✏️ {t('action.editLesson')}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onPreview}
                  disabled={saving}
                  className="rounded-lg border border-surface-border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  👁 {t('lessonStudio.preview')}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={saving}
                  className="rounded-lg border border-surface-border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {t('editor.cancel')}
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {saving ? t('common.loading') : t('lessonStudio.saveChanges')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
