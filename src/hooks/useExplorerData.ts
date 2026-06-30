import { useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { fetchLessons, fetchTopics, fetchTopicsCount } from '@/services/api';
import type { Lesson, TopicListItem } from '@/types/database';

export function useExplorerData() {
  const nav = useNavigation();
  const [topics, setTopics] = useState<TopicListItem[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const filters = useMemo(
    () => ({
      subjectId: nav.subjectId ?? undefined,
      schoolClass: nav.schoolClass ?? undefined,
      sectionId: nav.sectionId ?? undefined,
      search: nav.search || undefined,
      limit: nav.pageSize,
      offset: (nav.page - 1) * nav.pageSize,
    }),
    [
      nav.subjectId,
      nav.schoolClass,
      nav.sectionId,
      nav.search,
      nav.page,
      nav.pageSize,
    ],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const load = async () => {
      if (nav.dataType === 'topics') {
        const [data, count] = await Promise.all([
          fetchTopics(filters),
          fetchTopicsCount({
            subjectId: filters.subjectId,
            schoolClass: filters.schoolClass,
            sectionId: filters.sectionId,
            search: filters.search,
          }),
        ]);
        if (!cancelled) {
          setTopics(data);
          setTotalCount(count);
          if (data.length > 0 && !nav.selectedTopicId) {
            nav.setSelectedTopicId(data[0].id);
          } else if (
            nav.selectedTopicId &&
            !data.some((t) => t.id === nav.selectedTopicId)
          ) {
            nav.setSelectedTopicId(data[0]?.id ?? null);
          }
        }
      } else {
        const data = await fetchLessons({
          subjectId: filters.subjectId,
          schoolClass: filters.schoolClass,
          search: filters.search,
          limit: filters.limit,
          offset: filters.offset,
        });
        if (!cancelled) {
          setLessons(data);
          setTotalCount(data.length);
          nav.setSelectedTopicId(null);
        }
      }
    };

    load()
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav.dataType, filters, nav.explorerRefreshKey]);

  return {
    topics,
    lessons,
    loading,
    totalCount,
    hasMore: nav.page * nav.pageSize < totalCount,
  };
}
