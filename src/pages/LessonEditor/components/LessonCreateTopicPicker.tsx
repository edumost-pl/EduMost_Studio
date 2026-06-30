import { useI18n } from '@/i18n';
import { useNavigation } from '@/context/NavigationContext';
import type { Section, Subject, TopicListItem } from '@/types/database';

const fieldClass =
  'w-full min-w-0 rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100';

export interface LessonCreatePickerState {
  subjectId: number;
  schoolClass: number;
  sectionId: number | null;
  topicId: number | null;
}

export function LessonCreateTopicPicker({
  subjects,
  sections,
  topics,
  value,
  onChange,
  onSectionsChange,
}: {
  subjects: Subject[];
  sections: Section[];
  topics: TopicListItem[];
  value: LessonCreatePickerState;
  onChange: (patch: Partial<LessonCreatePickerState>) => void;
  onSectionsChange?: () => void;
}) {
  const { t } = useI18n();
  const nav = useNavigation();

  const openSectionCreate = () => {
    nav.openSectionCreateModal((section) => {
      onChange({ sectionId: section.id, topicId: null });
      onSectionsChange?.();
      nav.refreshExplorer();
    }, value.subjectId);
  };

  return (
    <section className="mb-5 rounded-xl border border-brand-200 bg-brand-50/40 p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-brand-700">
        {t('lessonStudio.linkToTopic')}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">
            {t('filter.subject')}
          </label>
          <select
            value={value.subjectId}
            onChange={(e) =>
              onChange({
                subjectId: Number(e.target.value),
                sectionId: null,
                topicId: null,
              })
            }
            className={fieldClass}
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name_ua}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">
            {t('filter.class')}
          </label>
          <select
            value={value.schoolClass}
            onChange={(e) =>
              onChange({
                schoolClass: Number(e.target.value),
                topicId: null,
              })
            }
            className={fieldClass}
          >
            {Array.from({ length: 8 }, (_, index) => index + 1).map((schoolClass) => (
              <option key={schoolClass} value={schoolClass}>
                {schoolClass}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label className="text-xs font-medium text-slate-600">{t('filter.section')}</label>
            <button
              type="button"
              onClick={openSectionCreate}
              className="text-xs font-medium text-brand-700 hover:text-brand-800"
            >
              {t('action.newSection')}
            </button>
          </div>
          <select
            value={value.sectionId ?? ''}
            onChange={(e) =>
              onChange({
                sectionId: e.target.value ? Number(e.target.value) : null,
                topicId: null,
              })
            }
            className={fieldClass}
          >
            <option value="">{t('lessonStudio.selectSection')}</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name_ua}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">
            {t('lessonStudio.selectTopic')}
          </label>
          <select
            value={value.topicId ?? ''}
            onChange={(e) =>
              onChange({
                topicId: e.target.value ? Number(e.target.value) : null,
              })
            }
            disabled={!value.sectionId}
            className={`${fieldClass} disabled:bg-surface-muted disabled:text-slate-400`}
          >
            <option value="">{t('lessonStudio.selectTopic')}</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.code} · {topic.name_ua}
              </option>
            ))}
          </select>
        </div>
      </div>

      {value.sectionId && topics.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">{t('lessonStudio.noTopicsInSection')}</p>
      ) : null}
    </section>
  );
}
