import { useEffect, useState } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { useI18n } from '@/i18n';
import { fetchDatabaseFileInfo } from '@/services/api';

function StatCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-surface-border bg-white p-5 shadow-panel">
      <div className="text-2xl leading-none">{icon}</div>
      <p className="mt-3 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

export function DashboardPage() {
  const { t } = useI18n();
  const nav = useNavigation();
  const [loading, setLoading] = useState(true);
  const [appVersion, setAppVersion] = useState(window.edumost?.version ?? '—');
  const [counts, setCounts] = useState({
    subjects: 0,
    sections: 0,
    topics: 0,
    lessons: 0,
    materials: 0,
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchDatabaseFileInfo()
      .then((info) => {
        if (cancelled) return;
        setCounts({
          subjects: info.counts.subjects,
          sections: info.counts.sections,
          topics: info.counts.topics,
          lessons: info.counts.lessons,
          materials: info.counts.lessonResources,
        });
        setAppVersion(info.appVersion);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [nav.explorerRefreshKey]);

  const stats = [
    { icon: '📚', label: t('dashboard.statSubjects'), value: counts.subjects },
    { icon: '📂', label: t('dashboard.statSections'), value: counts.sections },
    { icon: '📖', label: t('dashboard.statTopics'), value: counts.topics },
    { icon: '🎓', label: t('dashboard.statLessons'), value: counts.lessons },
    { icon: '📎', label: t('dashboard.statMaterials'), value: counts.materials },
  ];

  return (
    <div className="h-full overflow-auto p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">{t('app.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('dashboard.version', { version: appVersion })}</p>
          <p className="mt-2 text-base text-slate-600">{t('dashboard.welcome')}</p>
        </header>

        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-400">
            {t('common.loading')}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {stats.map((item) => (
              <StatCard
                key={item.label}
                icon={item.icon}
                label={item.label}
                value={item.value}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
