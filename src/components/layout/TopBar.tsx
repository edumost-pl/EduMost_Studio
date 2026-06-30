import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '@/context/NavigationContext';
import { useShell } from '@/context/ShellContext';
import { useI18n } from '@/i18n';
import { HelpModal } from './HelpModal';

function IconButton({
  children,
  label,
  badge,
  onClick,
}: {
  children: ReactNode;
  label: string;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
    >
      {children}
      {badge ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

export function TopBar() {
  const { t } = useI18n();
  const nav = useNavigation();
  const { toggleSidebar, showSyncNotice, syncNotice } = useShell();
  const navigate = useNavigate();
  const [search, setSearch] = useState(nav.search);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    setSearch(nav.search);
  }, [nav.search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search !== nav.search) {
        nav.setSearch(search);
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search, nav]);

  const handleLogoClick = () => {
    nav.goHome();
    navigate('/');
  };

  const handleSync = () => {
    nav.refreshExplorer();
    showSyncNotice(t('topbar.syncSuccess'));
  };

  return (
    <>
      <header className="relative flex h-14 shrink-0 items-center gap-4 border-b border-surface-border bg-white px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex items-center gap-3 rounded-lg transition-colors hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              EM
            </div>
            <div className="text-sm font-semibold text-brand-900">{t('app.title')}</div>
          </button>
          <button
            type="button"
            aria-label={t('topbar.menu')}
            onClick={toggleSidebar}
            className="ml-1 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            ☰
          </button>
        </div>

        <div className="mx-auto flex w-full max-w-2xl items-center">
          <div className="relative w-full">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search.placeholder')}
              className="h-10 w-full rounded-xl border border-surface-border bg-surface-muted pl-10 pr-16 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-surface-border bg-white px-1.5 py-0.5 text-[10px] text-slate-400">
              Ctrl+K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <IconButton label={t('topbar.sync')} onClick={handleSync}>
            🔄
          </IconButton>
          <IconButton label={t('topbar.help')} onClick={() => setHelpOpen(true)}>
            ?
          </IconButton>
          <IconButton label="Сповіщення" badge={3}>
            🔔
          </IconButton>
          <button
            type="button"
            className="ml-2 flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
              OT
            </span>
            <span className="text-sm font-medium text-slate-700">Oksana</span>
            <span className="text-slate-400">▾</span>
          </button>
        </div>

        {syncNotice ? (
          <div
            role="status"
            className="absolute bottom-0 left-1/2 z-50 translate-y-full -translate-x-1/2 pt-2"
          >
            <div className="rounded-xl border border-brand-200 bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
              {syncNotice}
            </div>
          </div>
        ) : null}
      </header>

      {helpOpen ? <HelpModal onClose={() => setHelpOpen(false)} /> : null}
    </>
  );
}
