import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigation, type DataType } from '@/context/NavigationContext';

export function useCurriculumNavigation() {
  const nav = useNavigation();
  const navigate = useNavigate();
  const location = useLocation();

  const ensureExplorer = useCallback(() => {
    if (location.pathname !== '/explorer') {
      navigate('/explorer');
    }
  }, [location.pathname, navigate]);

  const closeEditors = useCallback(() => {
    nav.closeTopicEditor();
    nav.closeLessonEditor();
    nav.closeCreateLesson();
  }, [nav]);

  const openExplorer = useCallback(
    (options?: {
      subjectId?: number;
      schoolClass?: number;
      sectionId?: number | null;
      selectedTopicId?: number | null;
      dataType?: DataType;
      page?: number;
      clearEditors?: boolean;
    }) => {
      if (options?.clearEditors !== false) {
        closeEditors();
      }
      if (options?.subjectId != null) {
        nav.setSubjectId(options.subjectId);
      }
      if (options?.schoolClass != null) {
        nav.setSchoolClass(options.schoolClass);
      }
      if (options?.sectionId !== undefined) {
        nav.setSectionId(options.sectionId);
      }
      if (options?.selectedTopicId !== undefined) {
        nav.setSelectedTopicId(options.selectedTopicId);
      }
      if (options?.dataType) {
        nav.setDataType(options.dataType);
      }
      if (options?.page != null) {
        nav.setPage(options.page);
      }
      ensureExplorer();
    },
    [closeEditors, ensureExplorer, nav],
  );

  const goToSubject = useCallback(
    (subjectId: number) => {
      openExplorer({ subjectId, sectionId: null, selectedTopicId: null, dataType: 'topics' });
    },
    [openExplorer],
  );

  const goToClass = useCallback(
    (subjectId: number, schoolClass: number) => {
      openExplorer({
        subjectId,
        schoolClass,
        sectionId: null,
        selectedTopicId: null,
        dataType: 'topics',
      });
    },
    [openExplorer],
  );

  const goToSection = useCallback(
    (subjectId: number, schoolClass: number, sectionId: number) => {
      openExplorer({
        subjectId,
        schoolClass,
        sectionId,
        selectedTopicId: null,
        dataType: 'topics',
      });
    },
    [openExplorer],
  );

  const goToTopicDetail = useCallback(
    (subjectId: number, schoolClass: number, sectionId: number, topicId: number) => {
      openExplorer({
        subjectId,
        schoolClass,
        sectionId,
        selectedTopicId: topicId,
        dataType: 'topics',
      });
    },
    [openExplorer],
  );

  const goToTopicEditor = useCallback(
    (topicId: number) => {
      closeEditors();
      nav.setEditingTopicId(topicId);
      ensureExplorer();
    },
    [closeEditors, ensureExplorer, nav],
  );

  const goToTopicLessons = useCallback(
    (topicId: number) => {
      goToTopicEditor(topicId);
    },
    [goToTopicEditor],
  );

  const goToLessonEditor = useCallback(
    (lessonId: number) => {
      nav.closeTopicEditor();
      nav.setEditingLessonId(lessonId);
      ensureExplorer();
    },
    [ensureExplorer, nav],
  );

  return {
    goToSubject,
    goToClass,
    goToSection,
    goToTopicDetail,
    goToTopicEditor,
    goToTopicLessons,
    goToLessonEditor,
    openExplorer,
  };
}
