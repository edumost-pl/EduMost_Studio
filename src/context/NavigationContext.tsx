import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import type { Section } from '@/types/database';

export type DataType = 'topics' | 'lessons';

export type SectionCreateSuccessHandler = (section: Section) => void;

export interface NavigationState {
  subjectId: number | null;
  schoolClass: number | null;
  sectionId: number | null;
  dataType: DataType;
  search: string;
  selectedTopicId: number | null;
  selectedLessonId: number | null;
  editingTopicId: number | null;
  editingLessonId: number | null;
  isCreatingTopic: boolean;
  creatingLessonForTopicId: number | null;
  isCreatingLessonFromExplorer: boolean;
  sectionCreateModalOpen: boolean;
  sectionCreateSubjectId: number | null;
  explorerRefreshKey: number;
  page: number;
  pageSize: number;
}

interface NavigationContextValue extends NavigationState {
  sectionCreateHandlers: MutableRefObject<{
    onSuccess?: SectionCreateSuccessHandler;
  }>;
  setSubjectId: (id: number) => void;
  setSchoolClass: (schoolClass: number) => void;
  setSectionId: (id: number | null) => void;
  setDataType: (type: DataType) => void;
  setSearch: (search: string) => void;
  setSelectedTopicId: (id: number | null) => void;
  setSelectedLessonId: (id: number | null) => void;
  setEditingTopicId: (id: number | null) => void;
  setEditingLessonId: (id: number | null) => void;
  startCreateTopic: () => void;
  startCreateLesson: (topicId: number) => void;
  startCreateLessonFromExplorer: () => void;
  openSectionCreateModal: (
    onSuccess?: SectionCreateSuccessHandler,
    subjectId?: number,
  ) => void;
  closeSectionCreateModal: () => void;
  closeTopicEditor: () => void;
  closeLessonEditor: () => void;
  closeCreateLesson: () => void;
  refreshExplorer: () => void;
  goHome: () => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

const defaultState: NavigationState = {
  subjectId: 1,
  schoolClass: 4,
  sectionId: 4,
  dataType: 'topics',
  search: '',
  selectedTopicId: null,
  selectedLessonId: null,
  editingTopicId: null,
  editingLessonId: null,
  isCreatingTopic: false,
  creatingLessonForTopicId: null,
  isCreatingLessonFromExplorer: false,
  sectionCreateModalOpen: false,
  sectionCreateSubjectId: null,
  explorerRefreshKey: 0,
  page: 1,
  pageSize: 20,
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NavigationState>(defaultState);
  const sectionCreateHandlers = useRef<{ onSuccess?: SectionCreateSuccessHandler }>({});

  const patch = useCallback((partial: Partial<NavigationState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const value = useMemo<NavigationContextValue>(
    () => ({
      ...state,
      sectionCreateHandlers,
      setSubjectId: (subjectId) =>
        patch({ subjectId, sectionId: null, page: 1, selectedTopicId: null }),
      setSchoolClass: (schoolClass) =>
        patch({ schoolClass, sectionId: null, page: 1, selectedTopicId: null }),
      setSectionId: (sectionId) =>
        patch({ sectionId, page: 1, selectedTopicId: null }),
      setDataType: (dataType) =>
        patch({ dataType, page: 1, selectedTopicId: null, selectedLessonId: null }),
      setSearch: (search) => patch({ search, page: 1 }),
      setSelectedTopicId: (selectedTopicId) => patch({ selectedTopicId }),
      setSelectedLessonId: (selectedLessonId) => patch({ selectedLessonId }),
      setEditingTopicId: (editingTopicId) =>
        patch({
          editingTopicId,
          isCreatingTopic: false,
          ...(editingTopicId != null ? { selectedTopicId: editingTopicId } : {}),
        }),
      setEditingLessonId: (editingLessonId) =>
        patch({
          editingLessonId,
          ...(editingLessonId != null ? { selectedLessonId: editingLessonId } : {}),
        }),
      startCreateTopic: () =>
        patch({
          isCreatingTopic: true,
          editingTopicId: null,
          creatingLessonForTopicId: null,
          isCreatingLessonFromExplorer: false,
        }),
      startCreateLesson: (topicId: number) =>
        patch({
          creatingLessonForTopicId: topicId,
          isCreatingLessonFromExplorer: false,
        }),
      startCreateLessonFromExplorer: () =>
        patch({
          isCreatingLessonFromExplorer: true,
          creatingLessonForTopicId: null,
          editingLessonId: null,
          editingTopicId: null,
          isCreatingTopic: false,
        }),
      openSectionCreateModal: (
        onSuccess?: SectionCreateSuccessHandler,
        subjectId?: number,
      ) => {
        sectionCreateHandlers.current.onSuccess = onSuccess;
        patch({
          sectionCreateModalOpen: true,
          sectionCreateSubjectId: subjectId ?? null,
        });
      },
      closeSectionCreateModal: () => {
        sectionCreateHandlers.current.onSuccess = undefined;
        patch({ sectionCreateModalOpen: false, sectionCreateSubjectId: null });
      },
      closeTopicEditor: () =>
        patch({ editingTopicId: null, isCreatingTopic: false }),
      closeCreateLesson: () =>
        patch({ creatingLessonForTopicId: null, isCreatingLessonFromExplorer: false }),
      closeLessonEditor: () => patch({ editingLessonId: null }),
      refreshExplorer: () =>
        setState((prev) => ({
          ...prev,
          explorerRefreshKey: prev.explorerRefreshKey + 1,
        })),
      goHome: () => {
        sectionCreateHandlers.current.onSuccess = undefined;
        setState({ ...defaultState });
      },
      setPage: (page) => patch({ page }),
      setPageSize: (pageSize) => patch({ pageSize, page: 1 }),
    }),
    [state, patch],
  );

  return (
    <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return ctx;
}
