import { Outlet, useLocation } from 'react-router-dom';
import { useShell } from '@/context/ShellContext';
import { Breadcrumbs } from './Breadcrumbs';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppShell() {
  const { sidebarCollapsed } = useShell();
  const location = useLocation();
  const showBreadcrumbs = location.pathname === '/explorer';

  return (
    <div className="flex h-screen min-h-0 flex-col bg-surface-muted">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        {!sidebarCollapsed ? <Sidebar /> : null}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {showBreadcrumbs ? (
            <div className="border-b border-surface-border bg-white px-6 py-4">
              <Breadcrumbs />
            </div>
          ) : null}
          <div className="min-h-0 flex-1">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
