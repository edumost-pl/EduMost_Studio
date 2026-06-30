import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SectionCreateModal } from '@/components/sections/SectionCreateModal';
import { useNavigation } from '@/context/NavigationContext';
import { useExplorerData } from '@/hooks/useExplorerData';
import { useI18n } from '@/i18n';
import { TopicEditorPage } from '@/pages/TopicEditor/TopicEditorPage';
import { LessonEditorPage } from '@/pages/LessonEditor/LessonEditorPage';
import { LessonsTable, TopicsTable } from './components/DataTable';
import { PaginationBar } from './components/PaginationBar';
import { TopicDetailPanel } from './components/TopicDetailPanel';

export function KnowledgeExplorerPage() {
  const { t } = useI18n();
  const nav = useNavigation();
  const { topics, lessons, loading, totalCount, hasMore } = useExplorerData();

  const resultLabel = useMemo(() => {
    return nav.dataType === 'topics'
      ? t('explorer.foundTopics', { count: totalCount })
      : t('explorer.foundLessons', { count: totalCount });
  }, [nav.dataType, totalCount, t]);

  if (nav.isCreatingLessonFromExplorer || nav.creatingLessonForTopicId != null) {
    return (
      <>
        <SectionCreateModal />
        <LessonEditorPage
          createFromExplorer={nav.isCreatingLessonFromExplorer}
          createForTopicId={nav.creatingLessonForTopicId ?? undefined}
        />
      </>
    );
  }

  if (nav.editingLessonId != null) {
    return (
      <>
        <SectionCreateModal />
        <LessonEditorPage lessonId={nav.editingLessonId} />
      </>
    );
  }

  if (nav.isCreatingTopic) {
    return (
      <>
        <SectionCreateModal />
        <TopicEditorPage isCreate />
      </>
    );
  }

  if (nav.editingTopicId != null) {
    return (
      <>
        <SectionCreateModal />
        <TopicEditorPage topicId={nav.editingTopicId} />
      </>
    );
  }

  return (
    <>
      <SectionCreateModal />
      <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-border bg-white px-6 py-3">
          <p className="text-sm font-medium text-slate-700">{resultLabel}</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => nav.startCreateTopic()}
              disabled={!nav.subjectId || !nav.schoolClass}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('action.newTopic')}
            </button>
            <button
              type="button"
              onClick={() => nav.startCreateLessonFromExplorer()}
              disabled={!nav.subjectId || !nav.schoolClass}
              className="rounded-lg border border-brand-600 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('action.newLesson')}
            </button>
            <button
              type="button"
              onClick={() => nav.openSectionCreateModal()}
              disabled={!nav.subjectId}
              className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('action.newSection')}
            </button>
            <Link
              to="/settings/directories"
              className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {t('action.directories')}
            </Link>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-sm text-slate-400">
              {t('common.loading')}
            </div>
          ) : nav.dataType === 'topics' ? (
            topics.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-sm text-slate-400">
                {t('common.noResults')}
              </div>
            ) : (
              <TopicsTable
                topics={topics}
                selectedId={nav.selectedTopicId}
                onSelect={nav.setSelectedTopicId}
                onOpen={nav.setEditingTopicId}
              />
            )
          ) : lessons.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-slate-400">
              {t('common.noResults')}
            </div>
          ) : (
            <LessonsTable
              lessons={lessons}
              selectedId={nav.selectedLessonId}
              onSelect={nav.setSelectedLessonId}
              onOpen={nav.setEditingLessonId}
            />
          )}
        </div>

        <PaginationBar
          page={nav.page}
          pageSize={nav.pageSize}
          hasMore={hasMore}
          onPageChange={nav.setPage}
          onPageSizeChange={nav.setPageSize}
        />
      </div>

      {nav.dataType === 'topics' ? (
        <TopicDetailPanel topicId={nav.selectedTopicId} />
      ) : null}
    </div>
    </>
  );
}
