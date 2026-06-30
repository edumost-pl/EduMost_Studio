import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { useI18n } from '@/i18n';
import {
  createLesson,
  fetchLessonAdjacent,
  fetchLessonCreateDefaults,
  fetchLessonDetail,
  fetchSectionsByClass,
  fetchSubjects,
  fetchTopicDetail,
  fetchTopics,
  updateLesson,
} from '@/services/api';
import type { LessonDetail, Section, Subject, TopicDetail, TopicListItem } from '@/types/database';
import { LessonEditForm } from './components/LessonEditForm';
import { LessonEditorFooter } from './components/LessonEditorFooter';
import {
  LessonEditorHeader,
  type LessonStudioMode,
} from './components/LessonEditorHeader';
import { LessonSequenceNav } from '@/components/layout/SequenceNav';
import { LessonEditorTabs } from './components/LessonEditorTabs';
import { LessonViewDocument } from './components/LessonViewDocument';
import type { LessonCreatePickerState } from './components/LessonCreateTopicPicker';
import {
  emptyLessonForm,
  formDataEqual,
  lessonDetailToForm,
  type LessonFormData,
} from './types';

function emptyStringsToNull(data: LessonFormData): Record<string, unknown> {
  const result: Record<string, unknown> = { ...data };
  for (const key of Object.keys(result)) {
    if (typeof result[key] === 'string' && result[key] === '') {
      result[key] = null;
    }
  }
  return result;
}

function parseSaveError(err: unknown): string | null {
  if (err instanceof Error && err.message.includes('DUPLICATE_CODE')) {
    return 'DUPLICATE_CODE';
  }
  return null;
}

function buildCreateLessonDetail(
  topicDetail: TopicDetail,
  subjectId: number,
  code: string,
): LessonDetail {
  const schoolClass = topicDetail.curriculum?.[0]?.school_class ?? 4;

  return {
    id: 0,
    code,
    subject_id: subjectId,
    school_class: schoolClass,
    lesson_type: 'New Knowledge',
    duration: 45,
    title_pl: '',
    title_ua: '',
    goal_pl: null,
    goal_ua: null,
    learning_results_pl: null,
    learning_results_ua: null,
    terminology_pl: null,
    terminology_ua: null,
    equipment_pl: null,
    equipment_ua: null,
    scenario_pl: null,
    scenario_ua: null,
    homework_pl: null,
    homework_ua: null,
    assessment_pl: null,
    assessment_ua: null,
    teacher_notes_pl: null,
    teacher_notes_ua: null,
    author: null,
    version: null,
    status: 'Draft',
    is_active: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subject_code: topicDetail.subject_code,
    subject_name_pl: topicDetail.subject_name_pl,
    subject_name_ua: topicDetail.subject_name_ua,
    topics: [
      {
        id: 0,
        lesson_id: 0,
        topic_id: topicDetail.id,
        is_primary: 1,
        display_order: 0,
        created_at: '',
        updated_at: '',
        topic_code: topicDetail.code,
        topic_name_pl: topicDetail.name_pl,
        topic_name_ua: topicDetail.name_ua,
        topic_prerequisites_pl: topicDetail.prerequisites_pl,
        topic_prerequisites_ua: topicDetail.prerequisites_ua,
        topic_outcomes_pl: topicDetail.outcomes_pl,
        topic_outcomes_ua: topicDetail.outcomes_ua,
        section_name_pl: topicDetail.section_name_pl,
        section_name_ua: topicDetail.section_name_ua,
        section_id: topicDetail.section_id,
      },
    ],
    resources: [],
  };
}

export function LessonEditorPage({
  lessonId,
  createForTopicId,
  createFromExplorer = false,
}: {
  lessonId?: number;
  createForTopicId?: number;
  createFromExplorer?: boolean;
}) {
  const isCreate = createFromExplorer || createForTopicId != null;
  const { t } = useI18n();
  const nav = useNavigation();
  const [detail, setDetail] = useState<LessonDetail | null>(null);
  const [form, setForm] = useState<LessonFormData | null>(null);
  const [original, setOriginal] = useState<LessonFormData | null>(null);
  const [mode, setMode] = useState<LessonStudioMode>(isCreate ? 'edit' : 'view');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adjacent, setAdjacent] = useState<{
    prev: { id: number; code: string; name: string } | null;
    next: { id: number; code: string; name: string } | null;
  }>({ prev: null, next: null });
  const [activeTab] = useState<'editor'>('editor');

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [topics, setTopics] = useState<TopicListItem[]>([]);
  const [picker, setPicker] = useState<LessonCreatePickerState>({
    subjectId: nav.subjectId ?? 1,
    schoolClass: nav.schoolClass ?? 4,
    sectionId: nav.sectionId,
    topicId: nav.selectedTopicId,
  });
  const [activeTopicId, setActiveTopicId] = useState<number | null>(
    createForTopicId ?? null,
  );

  const loadLessonForTopic = useCallback(
    async (topicId: number, cancelled: () => boolean) => {
      const topicDetail = await fetchTopicDetail(topicId);
      if (cancelled()) return false;
      if (!topicDetail) {
        setError('Topic not found');
        return false;
      }

      const subjectList = subjects.length > 0 ? subjects : await fetchSubjects();
      if (cancelled()) return false;
      if (subjects.length === 0) setSubjects(subjectList);

      const subject =
        subjectList.find((item) => item.code === topicDetail.subject_code) ??
        subjectList.find((item) => item.id === nav.subjectId);
      if (!subject) {
        setError('Subject not found');
        return false;
      }

      const schoolClass = topicDetail.curriculum?.[0]?.school_class ?? nav.schoolClass ?? 4;
      const defaults = await fetchLessonCreateDefaults(subject.id, schoolClass);
      if (cancelled()) return false;

      const stub = buildCreateLessonDetail(topicDetail, subject.id, defaults.code);
      setDetail(stub);
      const initial = emptyLessonForm(subject.id, schoolClass, defaults.code);
      setForm(initial);
      setOriginal(initial);
      setActiveTopicId(topicId);
      return true;
    },
    [nav.schoolClass, nav.subjectId, subjects],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setMode(isCreate ? 'edit' : 'view');

    const run = async () => {
      try {
        if (createFromExplorer) {
          const subjectList = await fetchSubjects();
          if (cancelled) return;
          setSubjects(subjectList);

          const initialPicker: LessonCreatePickerState = {
            subjectId: nav.subjectId ?? subjectList[0]?.id ?? 1,
            schoolClass: nav.schoolClass ?? 4,
            sectionId: nav.sectionId,
            topicId: nav.selectedTopicId,
          };
          setPicker(initialPicker);

          const sectionList = await fetchSectionsByClass(
            initialPicker.subjectId,
            initialPicker.schoolClass,
          );
          if (cancelled) return;
          setSections(sectionList);

          if (!initialPicker.sectionId && sectionList.length > 0) {
            initialPicker.sectionId = sectionList[0].id;
          }

          if (initialPicker.sectionId) {
            const topicList = await fetchTopics({
              subjectId: initialPicker.subjectId,
              sectionId: initialPicker.sectionId,
              schoolClass: initialPicker.schoolClass,
              limit: 500,
            });
            if (cancelled) return;
            setTopics(topicList);
          }

          if (initialPicker.topicId) {
            await loadLessonForTopic(initialPicker.topicId, () => cancelled);
          } else {
            setDetail(null);
            setForm(null);
            setOriginal(null);
          }
          return;
        }

        if (isCreate && createForTopicId) {
          await loadLessonForTopic(createForTopicId, () => cancelled);
          return;
        }

        if (lessonId) {
          const data = await fetchLessonDetail(lessonId);
          if (cancelled) return;
          if (!data) {
            setError('Lesson not found');
            return;
          }
          setDetail(data);
          const initial = lessonDetailToForm(data);
          setForm(initial);
          setOriginal(initial);
        }
      } catch (err) {
        console.error('[LessonEditor] load error:', err);
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [
    createForTopicId,
    createFromExplorer,
    isCreate,
    lessonId,
    loadLessonForTopic,
    nav.explorerRefreshKey,
    nav.sectionId,
    nav.selectedTopicId,
    nav.schoolClass,
    nav.subjectId,
  ]);

  useEffect(() => {
    if (!createFromExplorer) return;

    let cancelled = false;
    const run = async () => {
      try {
        const sectionList = await fetchSectionsByClass(
          picker.subjectId,
          picker.schoolClass,
        );
        if (cancelled) return;
        setSections(sectionList);

        if (!picker.sectionId) {
          setTopics([]);
          return;
        }

        const topicList = await fetchTopics({
          subjectId: picker.subjectId,
          sectionId: picker.sectionId,
          schoolClass: picker.schoolClass,
          limit: 500,
        });
        if (cancelled) return;
        setTopics(topicList);
      } catch (err) {
        console.error('[LessonEditor] picker load error:', err);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [createFromExplorer, picker.subjectId, picker.sectionId, picker.schoolClass, nav.explorerRefreshKey]);

  useEffect(() => {
    if (!createFromExplorer || nav.sectionId == null) return;
    if (nav.subjectId !== picker.subjectId) return;

    setPicker((prev) =>
      prev.sectionId === nav.sectionId ? prev : { ...prev, sectionId: nav.sectionId, topicId: null },
    );
  }, [createFromExplorer, nav.sectionId, nav.subjectId, picker.subjectId]);

  useEffect(() => {
    if (!createFromExplorer || !picker.topicId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    loadLessonForTopic(picker.topicId, () => cancelled)
      .catch((err: Error) => {
        console.error('[LessonEditor] topic load error:', err);
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [createFromExplorer, loadLessonForTopic, picker.topicId]);

  useEffect(() => {
    if (isCreate || !lessonId || !detail || !form) {
      setAdjacent({ prev: null, next: null });
      return;
    }
    const primaryTopic =
      detail.topics?.find((topic) => topic.is_primary === 1) ?? detail.topics?.[0];
    let cancelled = false;
    fetchLessonAdjacent(lessonId, {
      subjectId: detail.subject_id,
      schoolClass: form.school_class,
      topicId: primaryTopic?.topic_id,
    })
      .then((result) => {
        if (cancelled) return;
        setAdjacent({
          prev: result.prev
            ? { id: result.prev.id, code: result.prev.code, name: result.prev.title_pl }
            : null,
          next: result.next
            ? { id: result.next.id, code: result.next.code, name: result.next.title_pl }
            : null,
        });
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [lessonId, detail, form, isCreate, nav.explorerRefreshKey]);

  const isDirty = useMemo(
    () => Boolean(form && original && !formDataEqual(form, original)),
    [form, original],
  );

  const patchForm = useCallback((patch: Partial<LessonFormData>) => {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const handlePickerChange = useCallback((patch: Partial<LessonCreatePickerState>) => {
    setPicker((prev) => ({ ...prev, ...patch }));
    if (patch.topicId === null || patch.topicId === undefined) {
      if (patch.topicId === null) {
        setDetail(null);
        setForm(null);
        setOriginal(null);
        setActiveTopicId(null);
      }
    }
  }, []);

  const reloadSectionsForPicker = useCallback(async () => {
    const sectionList = await fetchSectionsByClass(
      picker.subjectId,
      picker.schoolClass,
    );
    setSections(sectionList);
  }, [picker.subjectId, picker.schoolClass]);

  const handleBack = useCallback(() => {
    if (isDirty && !window.confirm(t('editor.unsavedChanges'))) {
      return;
    }
    if (isCreate) {
      nav.closeCreateLesson();
    } else {
      nav.closeLessonEditor();
    }
  }, [isCreate, isDirty, nav, t]);

  const handleEdit = useCallback(() => {
    setMode('edit');
  }, []);

  const handlePreview = useCallback(() => {
    if (isCreate) return;
    setMode('view');
  }, [isCreate]);

  const handleCancel = useCallback(() => {
    if (isCreate) {
      handleBack();
      return;
    }
    if (isDirty && !window.confirm(t('editor.unsavedChanges'))) {
      return;
    }
    if (original) {
      setForm(original);
    }
    setMode('view');
  }, [handleBack, isCreate, isDirty, original, t]);

  const handleSave = useCallback(async () => {
    if (!form) return;

    const topicId = activeTopicId ?? createForTopicId ?? picker.topicId;
    if (isCreate && !topicId) {
      setError(t('lessonStudio.selectTopicRequired'));
      return;
    }

    if (!form.title_pl.trim() || !form.title_ua.trim()) {
      setError(t('editor.validationRequired'));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (isCreate && topicId) {
        const created = await createLesson(emptyStringsToNull(form), topicId);
        nav.refreshExplorer();
        nav.closeCreateLesson();
        if (created?.id) {
          nav.setEditingLessonId(created.id);
        }
      } else if (lessonId) {
        const updated = await updateLesson(lessonId, emptyStringsToNull(form));
        if (updated) {
          setDetail(updated);
          const next = lessonDetailToForm(updated);
          setForm(next);
          setOriginal(next);
        }
        nav.refreshExplorer();
        setMode('view');
      }
    } catch (err) {
      console.error('[LessonEditor] save error:', err);
      setError(
        parseSaveError(err) === 'DUPLICATE_CODE'
          ? t('editor.duplicateCode')
          : t('editor.saveError'),
      );
    } finally {
      setSaving(false);
    }
  }, [activeTopicId, createForTopicId, form, isCreate, lessonId, nav, picker.topicId, t]);

  if (loading && !createFromExplorer && (!isCreate || createForTopicId)) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        {error ?? t('common.loading')}
      </div>
    );
  }

  if (!isCreate && (!form || !detail)) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        {error ?? t('common.loading')}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <LessonEditorHeader
        detail={detail}
        form={form}
        mode={mode}
        isCreate={isCreate}
        createFromExplorer={createFromExplorer}
        onBack={handleBack}
        onEdit={handleEdit}
        onPreview={handlePreview}
        onCancel={handleCancel}
        onSave={handleSave}
        saving={saving}
        isDirty={isDirty}
      />
      {!isCreate && lessonId ? (
        <LessonSequenceNav
          prev={adjacent.prev}
          next={adjacent.next}
          onPrev={
            adjacent.prev ? () => nav.setEditingLessonId(adjacent.prev!.id) : undefined
          }
          onNext={
            adjacent.next ? () => nav.setEditingLessonId(adjacent.next!.id) : undefined
          }
        />
      ) : null}
      <LessonEditorTabs activeTab={activeTab} onTabChange={() => undefined} />

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6">
          {error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {mode === 'view' && !isCreate && form && detail ? (
            <LessonViewDocument detail={detail} form={form} />
          ) : (
            <LessonEditForm
              detail={detail}
              form={form}
              isCreate={isCreate}
              createFromExplorer={createFromExplorer}
              subjects={subjects}
              sections={sections}
              topics={topics}
              picker={picker}
              onPickerChange={handlePickerChange}
              onSectionsChange={reloadSectionsForPicker}
              onChange={patchForm}
            />
          )}
        </div>
      </div>

      {mode === 'edit' && form ? (
        <LessonEditorFooter
          saving={saving}
          isCreate={isCreate}
          onPreview={handlePreview}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      ) : null}
    </div>
  );
}
