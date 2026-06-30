import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

interface ShellContextValue {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  syncNotice: string | null;
  showSyncNotice: (message: string) => void;
}

const ShellContext = createContext<ShellContextValue | null>(null);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const syncTimeoutRef = useRef<number | null>(null);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const showSyncNotice = useCallback((message: string) => {
    if (syncTimeoutRef.current != null) {
      window.clearTimeout(syncTimeoutRef.current);
    }
    setSyncNotice(message);
    syncTimeoutRef.current = window.setTimeout(() => {
      setSyncNotice(null);
      syncTimeoutRef.current = null;
    }, 4000);
  }, []);

  const value = useMemo<ShellContextValue>(
    () => ({
      sidebarCollapsed,
      toggleSidebar,
      syncNotice,
      showSyncNotice,
    }),
    [sidebarCollapsed, toggleSidebar, syncNotice, showSyncNotice],
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell(): ShellContextValue {
  const ctx = useContext(ShellContext);
  if (!ctx) {
    throw new Error('useShell must be used within ShellProvider');
  }
  return ctx;
}
