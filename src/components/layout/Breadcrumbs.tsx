import { useNavigation } from '@/context/NavigationContext';
import { useNavigationData } from '@/hooks/useNavigationData';
import { useI18n } from '@/i18n';

export function Breadcrumbs() {
  const { t } = useI18n();
  const nav = useNavigation();
  const { subjects, sections } = useNavigationData(nav.subjectId, nav.schoolClass);

  const subject = subjects.find((s) => s.id === nav.subjectId);
  const section = sections.find((s) => s.id === nav.sectionId);

  const items = [
    subject?.name_ua,
    nav.schoolClass ? `${nav.schoolClass} ${t('common.class')}` : null,
    section?.name_ua,
  ].filter(Boolean) as string[];

  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="flex items-center gap-2">
          {index > 0 ? <span className="text-slate-300">›</span> : null}
          <button
            type="button"
            className="text-slate-500 transition-colors hover:text-brand-600"
          >
            {item}
          </button>
        </span>
      ))}
    </nav>
  );
}
