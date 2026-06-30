import { CurriculumBreadcrumbs } from '@/components/layout/CurriculumBreadcrumbs';
import { useNavigation } from '@/context/NavigationContext';
import { useCurriculumNavigation } from '@/hooks/useCurriculumNavigation';
import { useNavigationData } from '@/hooks/useNavigationData';
import { useI18n } from '@/i18n';

export function Breadcrumbs() {
  const { t } = useI18n();
  const nav = useNavigation();
  const { subjects, sections } = useNavigationData(nav.subjectId, nav.schoolClass);
  const { goToSubject, goToClass, goToSection, goToTopicDetail } = useCurriculumNavigation();

  const subject = subjects.find((s) => s.id === nav.subjectId);
  const section = sections.find((s) => s.id === nav.sectionId);

  const items = [];

  if (subject) {
    items.push({
      label: subject.name_ua,
      onClick: () => goToSubject(subject.id),
    });
  }

  if (nav.schoolClass) {
    items.push({
      label: `${nav.schoolClass} ${t('common.class')}`,
      onClick: subject
        ? () => goToClass(subject.id, nav.schoolClass!)
        : undefined,
    });
  }

  if (section && nav.schoolClass && subject) {
    items.push({
      label: section.name_ua,
      onClick: () => goToSection(subject.id, nav.schoolClass!, section.id),
    });
  }

  if (nav.selectedTopicId && nav.dataType === 'topics' && subject && nav.schoolClass && section) {
    items.push({
      label: t('topicCard.label'),
      onClick: () =>
        goToTopicDetail(subject.id, nav.schoolClass!, section.id, nav.selectedTopicId!),
    });
  }

  return <CurriculumBreadcrumbs items={items} />;
}
