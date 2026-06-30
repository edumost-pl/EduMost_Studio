import { BilingualFieldGroup } from '@/components/content/BilingualFieldGroup';
import { useI18n } from '@/i18n';
import { TerminologyEditor } from '@/pages/TopicEditor/components/TerminologyEditor';
import type { LessonDetail, Section, Subject, TopicListItem } from '@/types/database';
import type { LessonFormData } from '../types';
import { LessonBasicInfoPanel } from './LessonBasicInfoPanel';
import {
  LessonCreateTopicPicker,
  type LessonCreatePickerState,
} from './LessonCreateTopicPicker';
import { LessonResourcesList } from './LessonResourcesList';
import { LessonSectionCard } from './LessonSectionCard';

export function LessonEditForm({
  detail,
  form,
  isCreate,
  createFromExplorer,
  subjects,
  sections,
  topics,
  picker,
  onPickerChange,
  onSectionsChange,
  onChange,
}: {
  detail: LessonDetail | null;
  form: LessonFormData | null;
  isCreate?: boolean;
  createFromExplorer?: boolean;
  subjects?: Subject[];
  sections?: Section[];
  topics?: TopicListItem[];
  picker?: LessonCreatePickerState;
  onPickerChange?: (patch: Partial<LessonCreatePickerState>) => void;
  onSectionsChange?: () => void;
  onChange: (patch: Partial<LessonFormData>) => void;
}) {
  const { t } = useI18n();

  if (createFromExplorer && picker && onPickerChange && subjects && sections && topics) {
    return (
      <div>
        <LessonCreateTopicPicker
          subjects={subjects}
          sections={sections}
          topics={topics}
          value={picker}
          onChange={onPickerChange}
          onSectionsChange={onSectionsChange}
        />

        {!form || !detail ? (
          <div className="rounded-xl border border-dashed border-surface-border bg-surface-muted/40 px-6 py-12 text-center text-sm text-slate-500">
            {t('lessonStudio.selectTopicToContinue')}
          </div>
        ) : (
          <LessonEditFormBody detail={detail} form={form} isCreate={isCreate} onChange={onChange} />
        )}
      </div>
    );
  }

  if (!form || !detail) {
    return null;
  }

  return <LessonEditFormBody detail={detail} form={form} isCreate={isCreate} onChange={onChange} />;
}

function LessonEditFormBody({
  detail,
  form,
  isCreate,
  onChange,
}: {
  detail: LessonDetail;
  form: LessonFormData;
  isCreate?: boolean;
  onChange: (patch: Partial<LessonFormData>) => void;
}) {
  const { t } = useI18n();
  const resources = detail.resources ?? [];

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
      <div className="min-w-0 space-y-4 lg:col-span-3">
        <LessonBasicInfoPanel
          detail={detail}
          form={form}
          isCreate={isCreate}
          onChange={onChange}
        />

        <LessonSectionCard number={2} title={t('lessonStudio.goal')}>
          <BilingualFieldGroup
            valuePl={form.goal_pl}
            valueUa={form.goal_ua}
            onChangePl={(v) => onChange({ goal_pl: v })}
            onChangeUa={(v) => onChange({ goal_ua: v })}
            rows={4}
            maxLength={500}
          />
        </LessonSectionCard>

        <LessonSectionCard number={3} title={t('topicCard.prerequisites')}>
          <BilingualFieldGroup
            valuePl={form.learning_results_pl}
            valueUa={form.learning_results_ua}
            onChangePl={(v) => onChange({ learning_results_pl: v })}
            onChangeUa={(v) => onChange({ learning_results_ua: v })}
            rows={4}
            maxLength={500}
          />
        </LessonSectionCard>

        <LessonSectionCard title={t('topicCard.outcomes')}>
          <BilingualFieldGroup
            valuePl={form.assessment_pl}
            valueUa={form.assessment_ua}
            onChangePl={(v) => onChange({ assessment_pl: v })}
            onChangeUa={(v) => onChange({ assessment_ua: v })}
            rows={4}
            maxLength={500}
          />
        </LessonSectionCard>
      </div>

      <div className="min-w-0 space-y-4 lg:col-span-5">
        <LessonSectionCard number={6} title={t('lessonStudio.scenario')}>
          <BilingualFieldGroup
            valuePl={form.scenario_pl}
            valueUa={form.scenario_ua}
            onChangePl={(v) => onChange({ scenario_pl: v })}
            onChangeUa={(v) => onChange({ scenario_ua: v })}
            rows={18}
            maxLength={8000}
          />
        </LessonSectionCard>
      </div>

      <div className="min-w-0 space-y-4 lg:col-span-4">
        <LessonSectionCard number={4} title={t('lessonStudio.materials')}>
          <LessonResourcesList resources={resources} />
        </LessonSectionCard>

        <LessonSectionCard number={5} title={t('topicCard.keyTerms')}>
          <TerminologyEditor
            valuePl={form.terminology_pl}
            valueUa={form.terminology_ua}
            onChangePl={(v) => onChange({ terminology_pl: v })}
            onChangeUa={(v) => onChange({ terminology_ua: v })}
          />
        </LessonSectionCard>

        <LessonSectionCard number={7} title={t('lessonStudio.tabHomework')}>
          <BilingualFieldGroup
            valuePl={form.homework_pl}
            valueUa={form.homework_ua}
            onChangePl={(v) => onChange({ homework_pl: v })}
            onChangeUa={(v) => onChange({ homework_ua: v })}
            rows={4}
            maxLength={300}
          />
        </LessonSectionCard>

        <LessonSectionCard number={8} title={t('lessonStudio.teacherNotes')}>
          <BilingualFieldGroup
            valuePl={form.teacher_notes_pl}
            valueUa={form.teacher_notes_ua}
            onChangePl={(v) => onChange({ teacher_notes_pl: v })}
            onChangeUa={(v) => onChange({ teacher_notes_ua: v })}
            rows={4}
            maxLength={300}
          />
        </LessonSectionCard>
      </div>
    </div>
  );
}
