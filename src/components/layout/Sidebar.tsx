import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { useNavigationData, getSubjectIcon } from '@/hooks/useNavigationData';
import { useI18n } from '@/i18n';

function NavSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="px-3 py-3">
      <h2 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h2>
      <div className="space-y-0.5">{children}</div>
    </section>
  );
}

function NavItem({
  label,
  active = false,
  icon,
  onClick,
}: {
  label: string;
  active?: boolean;
  icon?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors',
        active
          ? 'bg-brand-50 font-medium text-brand-600'
          : 'text-slate-600 hover:bg-slate-100',
      ].join(' ')}
    >
      {icon ? <span className="text-base leading-none">{icon}</span> : null}
      <span>{label}</span>
    </button>
  );
}

export function Sidebar() {
  const { t } = useI18n();
  const nav = useNavigation();
  const navigate = useNavigate();
  const location = useLocation();
  const { subjects, sections } = useNavigationData(nav.subjectId, nav.schoolClass);

  const openExplorer = () => {
    if (location.pathname !== '/explorer') {
      navigate('/explorer');
    }
  };

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-surface-border bg-white">
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        <NavSection title={t('nav.subjects')}>
          {subjects.map((subject) => (
            <NavItem
              key={subject.id}
              label={subject.name_pl}
              icon={getSubjectIcon(subject)}
              active={nav.subjectId === subject.id}
              onClick={() => {
                nav.setSubjectId(subject.id);
                openExplorer();
              }}
            />
          ))}
        </NavSection>

        <NavSection title={t('nav.classes')}>
          {Array.from({ length: 8 }, (_, index) => {
            const schoolClass = index + 1;
            return (
              <NavItem
                key={schoolClass}
                label={`${schoolClass} ${t('common.class')}`}
                active={nav.schoolClass === schoolClass}
                onClick={() => {
                  nav.setSchoolClass(schoolClass);
                  openExplorer();
                }}
              />
            );
          })}
        </NavSection>

        {nav.schoolClass ? (
          <NavSection
            title={t('nav.sectionsForClass', { class: nav.schoolClass })}
          >
            {sections.map((section) => (
              <NavItem
                key={section.id}
                label={section.name_ua}
                active={nav.sectionId === section.id}
                onClick={() => {
                  nav.setSectionId(section.id);
                  openExplorer();
                }}
              />
            ))}
          </NavSection>
        ) : null}
      </div>

      <div className="border-t border-surface-border p-3">
        <Link
          to="/settings"
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-100"
        >
          <span>⚙️</span>
          <span>{t('nav.settings')}</span>
        </Link>
      </div>
    </aside>
  );
}
