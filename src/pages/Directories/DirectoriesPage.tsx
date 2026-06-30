import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SectionCreateModal } from '@/components/sections/SectionCreateModal';
import { useNavigation } from '@/context/NavigationContext';
import { useI18n } from '@/i18n';
import {
  archiveRefLessonStatus,
  archiveRefLessonType,
  archiveRefSchoolClass,
  archiveRefSection,
  archiveRefSubject,
  createRefLessonStatus,
  createRefLessonType,
  createRefSchoolClass,
  createRefSubject,
  deleteRefLessonStatus,
  deleteRefLessonType,
  deleteRefSchoolClass,
  deleteRefSection,
  deleteRefSubject,
  exportReferenceExcel,
  fetchRefLessonStatuses,
  fetchRefLessonTypes,
  fetchRefSchoolClasses,
  fetchRefSections,
  fetchRefSubjects,
  updateRefLessonStatus,
  updateRefLessonType,
  updateRefSchoolClass,
  updateRefSection,
  updateRefSubject,
  type ReferenceExportType,
} from '@/services/referenceApi';
import type {
  LessonStatus,
  LessonType,
  SchoolClass,
  SectionListItem,
  Subject,
} from '@/types/database';
import {
  ActiveBadge,
  ReferenceField,
  ReferenceInput,
  ReferenceModal,
  ReferenceRowActions,
  ReferenceTable,
  ReferenceToolbar,
  fieldClass,
} from './components/ReferenceUi';

type TabId = 'subjects' | 'sections' | 'lessonTypes' | 'statuses' | 'classes';

const TABS: TabId[] = ['subjects', 'sections', 'lessonTypes', 'statuses', 'classes'];

export function DirectoriesPage() {
  const { t } = useI18n();
  const nav = useNavigation();
  const [tab, setTab] = useState<TabId>('subjects');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sections, setSections] = useState<SectionListItem[]>([]);
  const [lessonTypes, setLessonTypes] = useState<LessonType[]>([]);
  const [lessonStatuses, setLessonStatuses] = useState<LessonStatus[]>([]);
  const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>([]);

  const [subjectModal, setSubjectModal] = useState<Subject | null | 'create'>(null);
  const [sectionModal, setSectionModal] = useState<SectionListItem | null>(null);
  const [nameModal, setNameModal] = useState<
    | { kind: 'lessonType'; item: LessonType | null }
    | { kind: 'status'; item: LessonStatus | null }
    | null
  >(null);
  const [classModal, setClassModal] = useState<SchoolClass | null | 'create'>(null);

  const [subjectForm, setSubjectForm] = useState({
    code: '',
    icon: '',
    name_ua: '',
    name_pl: '',
    is_active: 1,
  });
  const [sectionForm, setSectionForm] = useState({
    code: '',
    name_ua: '',
    name_pl: '',
    is_active: 1,
  });
  const [nameForm, setNameForm] = useState({ name: '', is_active: 1 });
  const [classForm, setClassForm] = useState({
    class_number: '',
    name_ua: '',
    name_pl: '',
    is_active: 1,
  });

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subjectList, sectionList, typeList, statusList, classList] = await Promise.all([
        fetchRefSubjects(),
        fetchRefSections(),
        fetchRefLessonTypes(),
        fetchRefLessonStatuses(),
        fetchRefSchoolClasses(),
      ]);
      setSubjects(subjectList);
      setSections(sectionList);
      setLessonTypes(typeList);
      setLessonStatuses(statusList);
      setSchoolClasses(classList);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const tabLabel = (id: TabId) => {
    switch (id) {
      case 'subjects':
        return t('directories.tabSubjects');
      case 'sections':
        return t('directories.tabSections');
      case 'lessonTypes':
        return t('directories.tabLessonTypes');
      case 'statuses':
        return t('directories.tabStatuses');
      case 'classes':
        return t('directories.tabClasses');
    }
  };

  const exportMap: Record<TabId, ReferenceExportType> = {
    subjects: 'subjects',
    sections: 'sections',
    lessonTypes: 'lessonTypes',
    statuses: 'lessonStatuses',
    classes: 'schoolClasses',
  };

  const handleExport = async () => {
    setBusy(true);
    setSuccess(null);
    try {
      const result = await exportReferenceExcel(exportMap[tab]);
      if (result.ok) setSuccess(t('directories.exportSuccess'));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteWithArchive = async (
    deleteFn: (id: number) => Promise<{ ok: boolean; reason?: string }>,
    archiveFn: (id: number) => Promise<unknown>,
    id: number,
  ) => {
    if (!window.confirm(t('directories.deleteConfirm'))) return;
    setBusy(true);
    setError(null);
    try {
      const result = await deleteFn(id);
      if (!result.ok && result.reason === 'IN_USE') {
        if (window.confirm(t('directories.archiveInsteadConfirm'))) {
          await archiveFn(id);
          setSuccess(t('directories.archivedSuccess'));
        }
      } else {
        setSuccess(t('directories.deletedSuccess'));
      }
      nav.refreshExplorer();
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const openSubjectCreate = () => {
    setSubjectForm({ code: '', icon: '📚', name_ua: '', name_pl: '', is_active: 1 });
    setSubjectModal('create');
  };

  const openSubjectEdit = (item: Subject) => {
    setSubjectForm({
      code: item.code,
      icon: item.icon ?? '',
      name_ua: item.name_ua,
      name_pl: item.name_pl,
      is_active: item.is_active,
    });
    setSubjectModal(item);
  };

  const saveSubject = async () => {
    setBusy(true);
    setError(null);
    try {
      if (subjectModal === 'create') {
        await createRefSubject({
          ...subjectForm,
          icon: subjectForm.icon || null,
        });
      } else if (subjectModal) {
        await updateRefSubject(subjectModal.id, {
          ...subjectForm,
          icon: subjectForm.icon || null,
        });
      }
      setSubjectModal(null);
      setSuccess(t('directories.savedSuccess'));
      nav.refreshExplorer();
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const openSectionEdit = (item: SectionListItem) => {
    setSectionForm({
      code: item.code,
      name_ua: item.name_ua,
      name_pl: item.name_pl,
      is_active: item.is_active,
    });
    setSectionModal(item);
  };

  const saveSection = async () => {
    if (!sectionModal) return;
    setBusy(true);
    try {
      await updateRefSection(sectionModal.id, sectionForm);
      setSectionModal(null);
      setSuccess(t('directories.savedSuccess'));
      nav.refreshExplorer();
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const openNameCreate = (kind: 'lessonType' | 'status') => {
    setNameForm({ name: '', is_active: 1 });
    setNameModal({ kind, item: null });
  };

  const openNameEdit = (kind: 'lessonType' | 'status', item: LessonType | LessonStatus) => {
    setNameForm({ name: item.name, is_active: item.is_active });
    setNameModal({ kind, item });
  };

  const saveNameItem = async () => {
    if (!nameModal) return;
    setBusy(true);
    try {
      if (nameModal.kind === 'lessonType') {
        if (nameModal.item) {
          await updateRefLessonType(nameModal.item.id, nameForm);
        } else {
          await createRefLessonType(nameForm);
        }
      } else if (nameModal.item) {
        await updateRefLessonStatus(nameModal.item.id, nameForm);
      } else {
        await createRefLessonStatus(nameForm);
      }
      setNameModal(null);
      setSuccess(t('directories.savedSuccess'));
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const openClassCreate = () => {
    setClassForm({ class_number: '', name_ua: '', name_pl: '', is_active: 1 });
    setClassModal('create');
  };

  const openClassEdit = (item: SchoolClass) => {
    setClassForm({
      class_number: String(item.class_number),
      name_ua: item.name_ua,
      name_pl: item.name_pl,
      is_active: item.is_active,
    });
    setClassModal(item);
  };

  const saveClass = async () => {
    setBusy(true);
    try {
      const payload = {
        class_number: Number(classForm.class_number),
        name_ua: classForm.name_ua,
        name_pl: classForm.name_pl,
        is_active: classForm.is_active,
      };
      if (classModal === 'create') {
        await createRefSchoolClass(payload);
      } else if (classModal) {
        await updateRefSchoolClass(classModal.id, payload);
      }
      setClassModal(null);
      setSuccess(t('directories.savedSuccess'));
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const newButtonLabel =
    tab === 'subjects'
      ? t('directories.newSubject')
      : tab === 'sections'
        ? t('directories.newSection')
        : tab === 'lessonTypes'
          ? t('directories.addItem')
          : tab === 'statuses'
            ? t('directories.addItem')
            : t('directories.newClass');

  const onNew =
    tab === 'subjects'
      ? openSubjectCreate
      : tab === 'sections'
        ? () => nav.openSectionCreateModal(() => {
            void loadAll();
            nav.refreshExplorer();
          })
        : tab === 'lessonTypes'
          ? () => openNameCreate('lessonType')
          : tab === 'statuses'
            ? () => openNameCreate('status')
            : openClassCreate;

  return (
    <>
      <SectionCreateModal />
      <div className="h-full overflow-y-auto bg-surface-muted">
        <div className="mx-auto max-w-6xl space-y-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Link
                to="/settings"
                className="text-sm font-medium text-brand-700 hover:text-brand-800"
              >
                ← {t('nav.settings')}
              </Link>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">{t('directories.title')}</h1>
              <p className="mt-1 text-sm text-slate-500">{t('directories.subtitle')}</p>
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          ) : null}

          <div className="rounded-xl border border-surface-border bg-white p-2 shadow-panel">
            <div className="flex flex-wrap gap-1">
              {TABS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={[
                    'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    tab === id
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {tabLabel(id)}
                </button>
              ))}
            </div>
          </div>

          <section className="rounded-xl border border-surface-border bg-white p-5 shadow-panel">
            <ReferenceToolbar
              newLabel={newButtonLabel}
              onNew={onNew}
              onExport={() => void handleExport()}
              importLabel={t('directories.importSoon')}
              busy={busy}
            />

            {loading ? (
              <div className="py-16 text-center text-sm text-slate-400">{t('common.loading')}</div>
            ) : tab === 'subjects' ? (
              <ReferenceTable
                headers={[
                  t('table.code'),
                  t('directories.icon'),
                  t('table.nameUa'),
                  t('table.namePl'),
                  t('directories.active'),
                  t('directories.actions'),
                ]}
              >
                {subjects.map((item) => (
                  <tr key={item.id} className="border-b border-surface-border last:border-0">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-700">
                      {item.code}
                    </td>
                    <td className="px-4 py-3 text-lg">{item.icon ?? '📚'}</td>
                    <td className="px-4 py-3">{item.name_ua}</td>
                    <td className="px-4 py-3 text-slate-600">{item.name_pl}</td>
                    <td className="px-4 py-3">
                      <ActiveBadge
                        active={item.is_active === 1}
                        yesLabel={t('editor.statusActive')}
                        noLabel={t('editor.statusInactive')}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ReferenceRowActions
                        editLabel={t('directories.edit')}
                        deleteLabel={t('directories.delete')}
                        onEdit={() => openSubjectEdit(item)}
                        onDelete={() =>
                          void handleDeleteWithArchive(deleteRefSubject, archiveRefSubject, item.id)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </ReferenceTable>
            ) : tab === 'sections' ? (
              <ReferenceTable
                headers={[
                  t('table.code'),
                  t('filter.subject'),
                  t('table.nameUa'),
                  t('table.namePl'),
                  t('directories.active'),
                  t('directories.actions'),
                ]}
              >
                {sections.map((item) => (
                  <tr key={item.id} className="border-b border-surface-border last:border-0">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-700">
                      {item.code}
                    </td>
                    <td className="px-4 py-3">{item.subject_name_ua}</td>
                    <td className="px-4 py-3">{item.name_ua}</td>
                    <td className="px-4 py-3 text-slate-600">{item.name_pl}</td>
                    <td className="px-4 py-3">
                      <ActiveBadge
                        active={item.is_active === 1}
                        yesLabel={t('editor.statusActive')}
                        noLabel={t('editor.statusInactive')}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ReferenceRowActions
                        editLabel={t('directories.edit')}
                        deleteLabel={t('directories.delete')}
                        onEdit={() => openSectionEdit(item)}
                        onDelete={() =>
                          void handleDeleteWithArchive(deleteRefSection, archiveRefSection, item.id)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </ReferenceTable>
            ) : tab === 'lessonTypes' ? (
              <ReferenceTable
                headers={[t('directories.name'), t('directories.active'), t('directories.actions')]}
              >
                {lessonTypes.map((item) => (
                  <tr key={item.id} className="border-b border-surface-border last:border-0">
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">
                      <ActiveBadge
                        active={item.is_active === 1}
                        yesLabel={t('editor.statusActive')}
                        noLabel={t('editor.statusInactive')}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ReferenceRowActions
                        editLabel={t('directories.edit')}
                        deleteLabel={t('directories.delete')}
                        onEdit={() => openNameEdit('lessonType', item)}
                        onDelete={() =>
                          void handleDeleteWithArchive(
                            deleteRefLessonType,
                            archiveRefLessonType,
                            item.id,
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </ReferenceTable>
            ) : tab === 'statuses' ? (
              <ReferenceTable
                headers={[t('directories.name'), t('directories.active'), t('directories.actions')]}
              >
                {lessonStatuses.map((item) => (
                  <tr key={item.id} className="border-b border-surface-border last:border-0">
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">
                      <ActiveBadge
                        active={item.is_active === 1}
                        yesLabel={t('editor.statusActive')}
                        noLabel={t('editor.statusInactive')}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ReferenceRowActions
                        editLabel={t('directories.edit')}
                        deleteLabel={t('directories.delete')}
                        onEdit={() => openNameEdit('status', item)}
                        onDelete={() =>
                          void handleDeleteWithArchive(
                            deleteRefLessonStatus,
                            archiveRefLessonStatus,
                            item.id,
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </ReferenceTable>
            ) : (
              <ReferenceTable
                headers={[
                  t('directories.classNumber'),
                  t('table.nameUa'),
                  t('table.namePl'),
                  t('directories.active'),
                  t('directories.actions'),
                ]}
              >
                {schoolClasses.map((item) => (
                  <tr key={item.id} className="border-b border-surface-border last:border-0">
                    <td className="px-4 py-3 font-semibold">{item.class_number}</td>
                    <td className="px-4 py-3">{item.name_ua}</td>
                    <td className="px-4 py-3 text-slate-600">{item.name_pl}</td>
                    <td className="px-4 py-3">
                      <ActiveBadge
                        active={item.is_active === 1}
                        yesLabel={t('editor.statusActive')}
                        noLabel={t('editor.statusInactive')}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ReferenceRowActions
                        editLabel={t('directories.edit')}
                        deleteLabel={t('directories.delete')}
                        onEdit={() => openClassEdit(item)}
                        onDelete={() =>
                          void handleDeleteWithArchive(
                            deleteRefSchoolClass,
                            archiveRefSchoolClass,
                            item.id,
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </ReferenceTable>
            )}
          </section>
        </div>
      </div>

      {subjectModal ? (
        <ReferenceModal
          title={
            subjectModal === 'create' ? t('directories.newSubject') : t('directories.editSubject')
          }
          onClose={() => setSubjectModal(null)}
          onSave={() => void saveSubject()}
          saving={busy}
          saveLabel={t('action.save')}
          cancelLabel={t('action.cancel')}
        >
          <ReferenceField label={t('table.code')}>
            <ReferenceInput
              value={subjectForm.code}
              onChange={(value) => setSubjectForm((prev) => ({ ...prev, code: value.toUpperCase() }))}
              className="font-mono"
            />
          </ReferenceField>
          <ReferenceField label={t('directories.icon')}>
            <ReferenceInput
              value={subjectForm.icon}
              onChange={(value) => setSubjectForm((prev) => ({ ...prev, icon: value }))}
            />
          </ReferenceField>
          <ReferenceField label={t('table.nameUa')}>
            <ReferenceInput
              value={subjectForm.name_ua}
              onChange={(value) => setSubjectForm((prev) => ({ ...prev, name_ua: value }))}
            />
          </ReferenceField>
          <ReferenceField label={t('table.namePl')}>
            <ReferenceInput
              value={subjectForm.name_pl}
              onChange={(value) => setSubjectForm((prev) => ({ ...prev, name_pl: value }))}
            />
          </ReferenceField>
          <ReferenceField label={t('directories.active')}>
            <select
              value={subjectForm.is_active}
              onChange={(e) =>
                setSubjectForm((prev) => ({ ...prev, is_active: Number(e.target.value) }))
              }
              className={fieldClass}
            >
              <option value={1}>{t('editor.statusActive')}</option>
              <option value={0}>{t('editor.statusInactive')}</option>
            </select>
          </ReferenceField>
        </ReferenceModal>
      ) : null}

      {sectionModal ? (
        <ReferenceModal
          title={t('directories.editSection')}
          onClose={() => setSectionModal(null)}
          onSave={() => void saveSection()}
          saving={busy}
          saveLabel={t('action.save')}
          cancelLabel={t('action.cancel')}
        >
          <ReferenceField label={t('table.code')}>
            <ReferenceInput
              value={sectionForm.code}
              onChange={(value) => setSectionForm((prev) => ({ ...prev, code: value }))}
              className="font-mono"
            />
          </ReferenceField>
          <ReferenceField label={t('table.nameUa')}>
            <ReferenceInput
              value={sectionForm.name_ua}
              onChange={(value) => setSectionForm((prev) => ({ ...prev, name_ua: value }))}
            />
          </ReferenceField>
          <ReferenceField label={t('table.namePl')}>
            <ReferenceInput
              value={sectionForm.name_pl}
              onChange={(value) => setSectionForm((prev) => ({ ...prev, name_pl: value }))}
            />
          </ReferenceField>
          <ReferenceField label={t('directories.active')}>
            <select
              value={sectionForm.is_active}
              onChange={(e) =>
                setSectionForm((prev) => ({ ...prev, is_active: Number(e.target.value) }))
              }
              className={fieldClass}
            >
              <option value={1}>{t('editor.statusActive')}</option>
              <option value={0}>{t('editor.statusInactive')}</option>
            </select>
          </ReferenceField>
        </ReferenceModal>
      ) : null}

      {nameModal ? (
        <ReferenceModal
          title={
            nameModal.item
              ? t('directories.editItem')
              : nameModal.kind === 'lessonType'
                ? t('directories.addLessonType')
                : t('directories.addStatus')
          }
          onClose={() => setNameModal(null)}
          onSave={() => void saveNameItem()}
          saving={busy}
          saveLabel={t('action.save')}
          cancelLabel={t('action.cancel')}
        >
          <ReferenceField label={t('directories.name')}>
            <ReferenceInput
              value={nameForm.name}
              onChange={(value) => setNameForm((prev) => ({ ...prev, name: value }))}
            />
          </ReferenceField>
          <ReferenceField label={t('directories.active')}>
            <select
              value={nameForm.is_active}
              onChange={(e) =>
                setNameForm((prev) => ({ ...prev, is_active: Number(e.target.value) }))
              }
              className={fieldClass}
            >
              <option value={1}>{t('editor.statusActive')}</option>
              <option value={0}>{t('editor.statusInactive')}</option>
            </select>
          </ReferenceField>
        </ReferenceModal>
      ) : null}

      {classModal ? (
        <ReferenceModal
          title={classModal === 'create' ? t('directories.newClass') : t('directories.editClass')}
          onClose={() => setClassModal(null)}
          onSave={() => void saveClass()}
          saving={busy}
          saveLabel={t('action.save')}
          cancelLabel={t('action.cancel')}
        >
          <ReferenceField label={t('directories.classNumber')}>
            <ReferenceInput
              value={classForm.class_number}
              onChange={(value) => setClassForm((prev) => ({ ...prev, class_number: value }))}
              type="number"
            />
          </ReferenceField>
          <ReferenceField label={t('table.nameUa')}>
            <ReferenceInput
              value={classForm.name_ua}
              onChange={(value) => setClassForm((prev) => ({ ...prev, name_ua: value }))}
            />
          </ReferenceField>
          <ReferenceField label={t('table.namePl')}>
            <ReferenceInput
              value={classForm.name_pl}
              onChange={(value) => setClassForm((prev) => ({ ...prev, name_pl: value }))}
            />
          </ReferenceField>
          <ReferenceField label={t('directories.active')}>
            <select
              value={classForm.is_active}
              onChange={(e) =>
                setClassForm((prev) => ({ ...prev, is_active: Number(e.target.value) }))
              }
              className={fieldClass}
            >
              <option value={1}>{t('editor.statusActive')}</option>
              <option value={0}>{t('editor.statusInactive')}</option>
            </select>
          </ReferenceField>
        </ReferenceModal>
      ) : null}
    </>
  );
}
