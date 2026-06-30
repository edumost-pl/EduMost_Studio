import { useEffect, useState } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import type { Section, Subject } from '@/types/database';
import { fetchSectionsBySubject, fetchSubjects } from '@/services/api';

const SUBJECT_ICONS: Record<string, string> = {
  MAT: '📐',
  POL: '🇵🇱',
  ENG: '🇬🇧',
  PRZ: '🌿',
  HIST: '🏛️',
  INF: '💻',
  FIZ: '⚛️',
  CHEM: '🧪',
};

export function getSubjectIcon(subject: Pick<Subject, 'icon' | 'code'>): string {
  if (subject.icon) return subject.icon;
  return SUBJECT_ICONS[subject.code] ?? '📚';
}

export function useNavigationData(
  subjectId: number | null,
  _schoolClass: number | null,
) {
  const nav = useNavigation();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchSubjects()
      .then((list) => {
        if (!cancelled) setSubjects(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [nav.explorerRefreshKey]);

  useEffect(() => {
    if (subjects.length === 0) return;
    const isCurrentValid =
      subjectId != null && subjects.some((subject) => subject.id === subjectId);
    if (!isCurrentValid) {
      nav.setSubjectId(subjects[0].id);
    }
  }, [subjects, subjectId, nav.setSubjectId]);

  useEffect(() => {
    if (!subjectId) {
      setSections([]);
      return;
    }
    fetchSectionsBySubject(subjectId).then(setSections);
  }, [subjectId, nav.explorerRefreshKey]);

  return { subjects, sections, loading };
}
