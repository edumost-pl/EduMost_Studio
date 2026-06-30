import { useEffect, useState, type ReactNode } from 'react';
import type { EduMostAPI } from '@/types/edumost-api';

declare global {
  interface Window {
    edumost: EduMostAPI;
  }
}

export function AppBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(() => Boolean(window.edumost));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.edumost) {
      setReady(true);
      return;
    }

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (window.edumost) {
        window.clearInterval(timer);
        setReady(true);
        return;
      }
      if (attempts >= 100) {
        window.clearInterval(timer);
        setError(
          'EduMost API (window.edumost) недоступний. Перевірте preload.js у Electron.',
        );
      }
    }, 50);

    return () => window.clearInterval(timer);
  }, []);

  if (error) {
    console.error('[EduMost Studio]', error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50 p-8">
        <div className="max-w-lg rounded-xl border border-amber-200 bg-white p-6">
          <h1 className="text-lg font-semibold text-amber-800">Помилка ініціалізації</h1>
          <p className="mt-2 text-sm text-amber-900">{error}</p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted text-sm text-slate-500">
        Завантаження EduMost Studio...
      </div>
    );
  }

  return children;
}
