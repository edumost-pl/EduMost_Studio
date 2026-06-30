import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BilingualFieldGroup } from '@/components/content/BilingualFieldGroup';
import { useNavigation } from '@/context/NavigationContext';
import { useI18n } from '@/i18n';
import {
  createTopic,
  fetchSectionsBySubject,
  fetchSubjects,
  fetchTopicAdjacent,
  fetchTopicCreateDefaults,
  fetchTopicDetail,
  updateTopic,
} from '@/services/api';
import { TopicSequenceNav } from '@/components/layout/SequenceNav';
import type { Section, Subject, TopicDetail } from '@/types/database';
import { TopicBasicInfoPanel } from './components/TopicBasicInfoPanel';
import { TopicEditorFooter } from './components/TopicEditorFooter';
import { TopicEditorHeader } from './components/TopicEditorHeader';
import { TopicEditorLessonsTable } from './components/TopicEditorLessonsTable';
import { TopicEditorRelatedList } from './components/TopicEditorRelatedList';
import { TerminologyEditor } from './components/TerminologyEditor';
import {
  emptyTopicForm,
  formDataEqual,
  matchSection,
  topicDetailToForm,
  type TopicFormData,
} from './types';

function emptyStringsToNull(data: TopicFormData): Record<string, unknown> {
  const result: Record<string, unknown> = { ...data };
  for (const key of Object.keys(result)) {
    if (typeof result[key] === 'string' && result[key] === '') {
      result[key] = null;
    }
  }
  delete result.section_name;
  delete result.school_class;
  return result;
}

function parseSaveError(err: unknown): string | null {
  if (err instanceof Error && err.message.includes('DUPLICATE_CODE')) {
    return 'DUPLICATE_CODE';
  }
  return null;
}

function buildSaveOptions(form: TopicFormData, subjectId: number) {
  return {
    schoolClass: form.school_class,
    subjectId,
    sectionName: form.section_name.trim(),
    sectionId: form.section_id > 0 ? form.section_id : null,
  };
}

export function TopicEditorPage({
  topicId,
  isCreate = false,
}: {
  topicId?: number;
  isCreate?: boolean;
}) {
  const { t } = useI18n();
  const nav = useNavigation();
  const [detail, setDetail] = useState<TopicDetail | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [form, setForm] = useState<TopicFormData | null>(null);
  const [original, setOriginal] = useState<TopicFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adjacent, setAdjacent] = useState<{
    prev: { id: number; code: string; name: string } | null;
    next: { id: number; code: string; name: string } | null;
  }>({ prev: null, next: null });
  const codeSuggestionKeyRef = useRef('');
  const lastExplorerRefreshKeyRef = useRef(nav.explorerRefreshKey);

  const subjectId = subject?.id ?? nav.subjectId;

  const loadSections = useCallback(async (resolvedSubjectId: number) => {
    const sectionList = await fetchSectionsBySubject(resolvedSubjectId);
    setSections(sectionList);
    return sectionList;
  }, []);

  const loadEditDetail = useCallback(
    async (id: number, cancelled: () => boolean) => {
      const data = await fetchTopicDetail(id);
      if (cancelled()) return;

      if (!data) {
        setError('Topic not found');
        return;
      }

      setDetail(data);
      const initial = topicDetailToForm(data);
      setForm(initial);
      setOriginal(initial);

      const subjects = await fetchSubjects();
      if (cancelled()) return;

      const matched = subjects.find((item) => item.code === data.subject_code);
      const resolvedSubjectId = matched?.id ?? nav.subjectId;
      if (resolvedSubjectId) {
        setSubject(matched ?? subjects.find((item) => item.id === resolvedSubjectId) ?? null);
        await loadSections(resolvedSubjectId);
      }
    },
    [loadSections, nav.subjectId],
  );

  const loadCreateForm = useCallback(
    async (cancelled: () => boolean) => {
      const subjects = await fetchSubjects();
      if (cancelled()) return;

      const resolvedSubjectId = nav.subjectId ?? subjects[0]?.id;
      if (!resolvedSubjectId) {
        setError('Subject not found');
        return;
      }

      const matchedSubject =
        subjects.find((item) => item.id === resolvedSubjectId) ?? null;
      setSubject(matchedSubject);

      const sectionList = await loadSections(resolvedSubjectId);
      if (cancelled()) return;

      const schoolClass = nav.schoolClass ?? 4;
      const selectedSection =
        (nav.sectionId ? sectionList.find((section) => section.id === nav.sectionId) : undefined) ??
        sectionList[0];

      const sectionName = selectedSection?.name_ua ?? '';
      const sectionId = selectedSection?.id ?? 0;

      let code = '';
      if (sectionName && sectionId > 0) {
        const defaults = await fetchTopicCreateDefaults({
          subjectId: resolvedSubjectId,
          schoolClass,
          sectionName,
          sectionId,
        });
        if (cancelled()) return;
        code = defaults.code;
      }

      const initial = emptyTopicForm(sectionId, sectionName, code, schoolClass);
      setForm(initial);
      setOriginal(initial);
      setDetail(null);
      codeSuggestionKeyRef.current = `${sectionName}:${sectionId}`;
    },
    [loadSections, nav.schoolClass, nav.sectionId, nav.subjectId],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const run = async () => {
      try {
        if (isCreate) {
          await loadCreateForm(() => cancelled);
        } else if (topicId) {
          await loadEditDetail(topicId, () => cancelled);
        }
      } catch (err) {
        console.error('[TopicEditor] load error:', err);
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [isCreate, topicId, loadCreateForm, loadEditDetail]);

  const isDirty = useMemo(
    () => Boolean(form && original && !formDataEqual(form, original)),
    [form, original],
  );

  useEffect(() => {
    if (isCreate || !topicId || isDirty) return;
    if (lastExplorerRefreshKeyRef.current === nav.explorerRefreshKey) return;
    lastExplorerRefreshKeyRef.current = nav.explorerRefreshKey;

    let cancelled = false;
    void loadEditDetail(topicId, () => cancelled).catch((err: Error) => {
      console.error('[TopicEditor] refresh error:', err);
    });

    return () => {
      cancelled = true;
    };
  }, [isCreate, isDirty, loadEditDetail, nav.explorerRefreshKey, topicId]);

  useEffect(() => {
    if (!isCreate || !form || !subjectId || !form.section_name.trim()) return;

    const nextKey = `${form.section_name}:${form.section_id}`;
    if (codeSuggestionKeyRef.current === nextKey) return;
    codeSuggestionKeyRef.current = nextKey;

    let cancelled = false;
    fetchTopicCreateDefaults({
      subjectId,
      schoolClass: form.school_class,
      sectionName: form.section_name,
      sectionId: form.section_id > 0 ? form.section_id : null,
    })
      .then((defaults) => {
        if (cancelled) return;
        setForm((prev) => (prev ? { ...prev, code: defaults.code } : prev));
        setOriginal((prev) => (prev ? { ...prev, code: defaults.code } : prev));
      })
      .catch((err: Error) => {
        console.error('[TopicEditor] code suggestion error:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [form?.school_class, form?.section_id, form?.section_name, isCreate, subjectId]);

  useEffect(() => {
    if (isCreate || !topicId || !subjectId || !form?.school_class) {
      setAdjacent({ prev: null, next: null });
      return;
    }
    let cancelled = false;
    fetchTopicAdjacent(topicId, {
      subjectId,
      schoolClass: form.school_class,
      sectionId: nav.sectionId ?? undefined,
    })
      .then((result) => {
        if (cancelled) return;
        setAdjacent({
          prev: result.prev
            ? {
                id: result.prev.id,
                code: result.prev.code,
                name: result.prev.name_pl,
              }
            : null,
          next: result.next
            ? {
                id: result.next.id,
                code: result.next.code,
                name: result.next.name_pl,
              }
            : null,
        });
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [topicId, subjectId, form?.school_class, nav.sectionId, isCreate, nav.explorerRefreshKey]);

  const patchForm = useCallback((patch: Partial<TopicFormData>) => {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const handleBack = useCallback(() => {
    if (isDirty && !window.confirm(t('editor.unsavedChanges'))) {
      return;
    }
    nav.closeTopicEditor();
  }, [isDirty, nav, t]);

  const handleCancel = handleBack;

  const handleSave = useCallback(async () => {
    if (!form || !subjectId) return;

    if (!form.name_pl.trim() || !form.name_ua.trim() || !form.section_name.trim()) {
      setError(t('editor.validationRequired'));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const options = buildSaveOptions(form, subjectId);
      const payload = emptyStringsToNull(form);

      if (isCreate) {
        const created = await createTopic(payload, options);
        if (!created?.id) {
          setError(t('editor.saveError'));
          return;
        }
        nav.refreshExplorer();
        nav.setEditingTopicId(created.id);
        return;
      }

      if (topicId) {
        const updated = await updateTopic(topicId, payload, options);
        if (updated) {
          setDetail(updated);
          const next = topicDetailToForm(updated);
          setForm(next);
          setOriginal(next);
        }
        nav.setSelectedTopicId(topicId);
        nav.refreshExplorer();
      }
    } catch (err) {
      console.error('[TopicEditor] save error:', err);
      setError(
        parseSaveError(err) === 'DUPLICATE_CODE'
          ? t('editor.duplicateCode')
          : t('editor.saveError'),
      );
    } finally {
      setSaving(false);
    }
  }, [form, isCreate, nav, subjectId, t, topicId]);

  const handleDelete = useCallback(async () => {
    if (!topicId || isCreate) return;
    if (!window.confirm(t('editor.deleteConfirm'))) return;
    setSaving(true);
    setError(null);
    try {
      await updateTopic(topicId, { is_active: 0 });
      nav.refreshExplorer();
      nav.closeTopicEditor();
    } catch (err) {
      console.error('[TopicEditor] delete error:', err);
      setError(t('editor.saveError'));
    } finally {
      setSaving(false);
    }
  }, [isCreate, nav, t, topicId]);

  const handleNewLesson = useCallback(() => {
    if (topicId) {
      nav.startCreateLesson(topicId);
    }
  }, [nav, topicId]);

  const reloadSections = useCallback(async () => {
    if (subjectId) {
      await loadSections(subjectId);
    }
  }, [loadSections, subjectId]);

  useEffect(() => {
    if (!isCreate && topicId && sections.length === 0 && subjectId) {
      void loadSections(subjectId);
    }
  }, [isCreate, loadSections, sections.length, subjectId, topicId]);

  if (loading || !form) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        {error ?? t('common.loading')}
      </div>
    );
  }

  if (!isCreate && !detail) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        {error ?? t('common.noResults')}
      </div>
    );
  }

  const lessons = detail?.lessons ?? [];
  const relations = detail?.relations ?? [];
  const matchedSection = matchSection(sections, form.section_name);
  const sectionName = form.section_name || matchedSection?.name_ua || detail?.section_name_ua || '—';

  return (
    <div className="flex h-full min-h-0 flex-col">
      <TopicEditorHeader
        detail={detail}
        form={form}
        isCreate={isCreate}
        subjectId={subjectId ?? null}
        subjectNameUa={subject?.name_ua ?? detail?.subject_name_ua ?? '—'}
        sectionNameUa={sectionName}
        schoolClass={form.school_class}
        lessonsCount={lessons.length}
        onBack={handleBack}
        onNewLesson={!isCreate && topicId ? handleNewLesson : undefined}
        isDirty={isDirty}
      />

      {!isCreate ? (
        <TopicSequenceNav
          prev={adjacent.prev}
          next={adjacent.next}
          onPrev={
            adjacent.prev
              ? () => nav.setEditingTopicId(adjacent.prev!.id)
              : undefined
          }
          onNext={
            adjacent.next
              ? () => nav.setEditingTopicId(adjacent.next!.id)
              : undefined
          }
        />
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-xl border border-surface-border bg-white p-5">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t('editor.description')}
              </h2>
              <BilingualFieldGroup
                labelPl={t('content.labelPl')}
                labelUa={t('content.labelUa')}
                valuePl={form.description_pl}
                valueUa={form.description_ua}
                onChangePl={(v) => patchForm({ description_pl: v })}
                onChangeUa={(v) => patchForm({ description_ua: v })}
                rows={5}
                maxLength={500}
              />
            </section>

            <section className="rounded-xl border border-surface-border bg-white p-5">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t('topicCard.prerequisites')}
              </h2>
              <BilingualFieldGroup
                labelPl={t('content.labelPl')}
                labelUa={t('content.labelUa')}
                valuePl={form.prerequisites_pl}
                valueUa={form.prerequisites_ua}
                onChangePl={(v) => patchForm({ prerequisites_pl: v })}
                onChangeUa={(v) => patchForm({ prerequisites_ua: v })}
                rows={4}
                maxLength={300}
              />
            </section>

            <section className="rounded-xl border border-surface-border bg-white p-5">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t('topicCard.outcomes')}
              </h2>
              <BilingualFieldGroup
                labelPl={t('content.labelPl')}
                labelUa={t('content.labelUa')}
                valuePl={form.outcomes_pl}
                valueUa={form.outcomes_ua}
                onChangePl={(v) => patchForm({ outcomes_pl: v })}
                onChangeUa={(v) => patchForm({ outcomes_ua: v })}
                rows={4}
                maxLength={300}
              />
            </section>

            <section className="rounded-xl border border-surface-border bg-white p-5">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t('editor.methodology')}
              </h2>
              <BilingualFieldGroup
                labelPl={t('content.labelPl')}
                labelUa={t('content.labelUa')}
                valuePl={form.methodology_pl}
                valueUa={form.methodology_ua}
                onChangePl={(v) => patchForm({ methodology_pl: v })}
                onChangeUa={(v) => patchForm({ methodology_ua: v })}
                rows={4}
                maxLength={500}
              />
            </section>

            {!isCreate ? (
              <section className="rounded-xl border border-surface-border bg-white p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {t('editor.lessonsTitle')}
                  </h2>
                  <button
                    type="button"
                    onClick={handleNewLesson}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                  >
                    {t('action.newLesson')}
                  </button>
                </div>
                <TopicEditorLessonsTable lessons={lessons} onNewLesson={handleNewLesson} />
              </section>
            ) : null}
          </div>

          <div className="space-y-6">
            <TopicBasicInfoPanel
              form={form}
              sections={sections}
              isCreate={isCreate}
              onChange={patchForm}
              onSectionsChange={reloadSections}
            />

            <section className="rounded-xl border border-surface-border bg-white p-5">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t('topicCard.keyTerms')}
              </h2>
              <TerminologyEditor
                valuePl={form.terminology_pl}
                valueUa={form.terminology_ua}
                onChangePl={(v) => patchForm({ terminology_pl: v })}
                onChangeUa={(v) => patchForm({ terminology_ua: v })}
              />
            </section>

            {!isCreate ? (
              <section className="rounded-xl border border-surface-border bg-white p-5">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t('topicCard.relatedTopics')}
                </h2>
                <TopicEditorRelatedList relations={relations} />
              </section>
            ) : null}
          </div>
        </div>
      </div>

      <TopicEditorFooter
        saving={saving}
        isCreate={isCreate}
        onCancel={handleCancel}
        onDelete={handleDelete}
        onSave={handleSave}
      />
    </div>
  );
}
