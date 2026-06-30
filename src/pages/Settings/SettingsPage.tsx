import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigation } from '@/context/NavigationContext';
import { useI18n } from '@/i18n';
import {
  createDatabaseBackup,
  exportDatabase,
  fetchDatabaseFileInfo,
  fetchSettings,
  importDatabase,
  listDatabaseBackups,
  openDatabaseFolder,
  openFolderPath,
  restoreDatabaseBackup,
  selectFolderPath,
  updateSettings,
} from '@/services/api';
import type { BackupEntry, DatabaseFileInfo, Settings } from '@/types/database';
import {
  formatDateTime,
  formatFileSize,
  SettingsActionButton,
  SettingsCard,
  SettingsInfoRow,
} from './components/SettingsCard';

export function SettingsPage() {
  const { t } = useI18n();
  const nav = useNavigation();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<DatabaseFileInfo | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [backups, setBackups] = useState<BackupEntry[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [info, currentSettings, backupList] = await Promise.all([
        fetchDatabaseFileInfo(),
        fetchSettings(),
        listDatabaseBackups(),
      ]);
      setFileInfo(info);
      setSettings(currentSettings ?? null);
      setBackups(backupList);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const patchSettings = useCallback(
    async (patch: Partial<Settings>) => {
      setBusy(true);
      setError(null);
      setSuccess(null);
      try {
        const updated = await updateSettings(patch);
        if (updated) {
          setSettings(updated);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const handleCopyPath = useCallback(async () => {
    if (!fileInfo?.path) return;
    await navigator.clipboard.writeText(fileInfo.path);
    setSuccess(t('settings.pathCopied'));
  }, [fileInfo?.path, t]);

  const handleExport = useCallback(async () => {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await exportDatabase();
      if (result.ok) {
        setSuccess(t('settings.exportSuccess'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }, [t]);

  const handleImport = useCallback(async () => {
    if (!window.confirm(t('settings.importConfirm'))) {
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await importDatabase(settings?.auto_backup_before_import === 1);
      if (!result.ok) {
        return;
      }
      nav.refreshExplorer();
      await loadData();
      setSuccess(t('settings.importSuccess'));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }, [loadData, nav, settings?.auto_backup_before_import, t]);

  const handleCreateBackup = useCallback(async () => {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await createDatabaseBackup();
      await loadData();
      setSuccess(t('settings.backupCreated'));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }, [loadData, t]);

  const handleRestoreBackup = useCallback(async () => {
    if (!window.confirm(t('settings.restoreConfirm'))) {
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await restoreDatabaseBackup();
      if (!result.ok) {
        return;
      }
      nav.refreshExplorer();
      await loadData();
      setSuccess(t('settings.restoreSuccess'));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }, [loadData, nav, t]);

  const handleChangeMaterialsFolder = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await selectFolderPath(settings?.materials_path ?? undefined);
      if (result.ok && result.path) {
        await patchSettings({ materials_path: result.path });
        setSuccess(t('settings.materialsPathUpdated'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }, [patchSettings, settings?.materials_path, t]);

  if (loading || !fileInfo) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-surface-muted">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t('settings.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('settings.subtitle')}</p>
        </div>

        <SettingsCard
          icon="📚"
          title={t('directories.title')}
          description={t('directories.settingsLinkDescription')}
        >
          <Link
            to="/settings/directories"
            className="inline-flex rounded-xl border border-brand-600 px-4 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
          >
            {t('directories.openLink')} →
          </Link>
        </SettingsCard>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        ) : null}

        {fileInfo.counts.subjects === 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {t('settings.emptyDatabaseWarning')}
          </div>
        ) : null}

        {fileInfo.discoveredDbFiles.some(
          (candidate) =>
            candidate.path !== fileInfo.path && candidate.counts.topics > fileInfo.counts.topics,
        ) ? (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            {t('settings.alternativeDbHint')}
          </div>
        ) : null}

        <SettingsCard icon="🗄️" title={t('settings.databaseTitle')} description={t('settings.databaseDescription')}>
          <dl>
            <SettingsInfoRow
              label={t('settings.runtimeMode')}
              value={
                fileInfo.runtimeMode === 'production'
                  ? t('settings.runtimeProduction')
                  : t('settings.runtimeDevelopment')
              }
            />
            <SettingsInfoRow
              label={t('settings.userDataPath')}
              value={<span className="break-all font-mono text-xs">{fileInfo.userDataPath}</span>}
            />
            <SettingsInfoRow label={t('settings.fileName')} value={fileInfo.fileName} />
            <SettingsInfoRow
              label={t('settings.fullPath')}
              value={<span className="break-all font-mono text-xs">{fileInfo.path}</span>}
            />
            {fileInfo.settingsDbPath ? (
              <SettingsInfoRow
                label={t('settings.settingsDbPath')}
                value={<span className="break-all font-mono text-xs">{fileInfo.settingsDbPath}</span>}
              />
            ) : null}
            <SettingsInfoRow label={t('settings.fileSize')} value={formatFileSize(fileInfo.sizeBytes)} />
            <SettingsInfoRow
              label={t('settings.lastModified')}
              value={formatDateTime(fileInfo.modifiedAt)}
            />
          </dl>
          {fileInfo.discoveredDbFiles.length > 1 ? (
            <div className="mt-4 rounded-lg border border-surface-border bg-surface-muted/40 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t('settings.discoveredDbFiles')}
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                {fileInfo.discoveredDbFiles.map((candidate) => (
                  <li key={candidate.path} className="rounded-md border border-surface-border bg-white px-3 py-2">
                    <div className="break-all font-mono text-xs text-slate-800">{candidate.path}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      {formatFileSize(candidate.sizeBytes)} · {t('settings.countSubjects')}:{' '}
                      {candidate.counts.subjects} · {t('settings.countTopics')}: {candidate.counts.topics}
                      {candidate.path === fileInfo.path ? ' · active' : ''}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <SettingsActionButton onClick={() => void openDatabaseFolder()} disabled={busy}>
              📂 {t('settings.openDatabaseFolder')}
            </SettingsActionButton>
            <SettingsActionButton onClick={() => void handleCopyPath()} disabled={busy}>
              📋 {t('settings.copyPath')}
            </SettingsActionButton>
          </div>
        </SettingsCard>

        <SettingsCard icon="⬇️" title={t('settings.exportTitle')} description={t('settings.exportDescription')}>
          <SettingsActionButton variant="primary" onClick={() => void handleExport()} disabled={busy}>
            ⬇ {t('settings.exportDatabase')}
          </SettingsActionButton>
        </SettingsCard>

        <SettingsCard icon="⬆️" title={t('settings.importTitle')} description={t('settings.importDescription')}>
          <SettingsActionButton onClick={() => void handleImport()} disabled={busy}>
            ⬆ {t('settings.importDatabase')}
          </SettingsActionButton>
        </SettingsCard>

        <SettingsCard icon="💾" title={t('settings.backupTitle')} description={t('settings.backupDescription')}>
          <div className="flex flex-wrap gap-3">
            <SettingsActionButton variant="primary" onClick={() => void handleCreateBackup()} disabled={busy}>
              {t('settings.createBackup')}
            </SettingsActionButton>
            <SettingsActionButton onClick={() => void handleRestoreBackup()} disabled={busy}>
              {t('settings.restoreBackup')}
            </SettingsActionButton>
          </div>

          {settings?.last_backup ? (
            <p className="mt-4 text-sm text-slate-500">
              {t('settings.lastBackup')}: {formatDateTime(settings.last_backup)}
            </p>
          ) : null}

          {backups.length > 0 ? (
            <div className="mt-4 rounded-lg border border-surface-border bg-surface-muted/40 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t('settings.recentBackups')}
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                {backups.slice(0, 5).map((backup) => (
                  <li key={backup.path} className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs">{backup.fileName}</span>
                    <span className="text-xs text-slate-400">
                      {formatFileSize(backup.sizeBytes)} · {formatDateTime(backup.modifiedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </SettingsCard>

        <SettingsCard icon="🔄" title={t('settings.autoBackupTitle')} description={t('settings.autoBackupDescription')}>
          <div className="space-y-3">
            <label className="flex items-start gap-3 rounded-lg border border-surface-border px-4 py-3 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={settings?.auto_backup === 1}
                disabled={busy}
                onChange={(event) => void patchSettings({ auto_backup: event.target.checked ? 1 : 0 })}
                className="mt-0.5 h-4 w-4 rounded border-surface-border text-brand-600 focus:ring-brand-200"
              />
              <span className="text-sm text-slate-700">{t('settings.autoBackupOnStartup')}</span>
            </label>
            <label className="flex items-start gap-3 rounded-lg border border-surface-border px-4 py-3 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={settings?.auto_backup_before_import === 1}
                disabled={busy}
                onChange={(event) =>
                  void patchSettings({
                    auto_backup_before_import: event.target.checked ? 1 : 0,
                  })
                }
                className="mt-0.5 h-4 w-4 rounded border-surface-border text-brand-600 focus:ring-brand-200"
              />
              <span className="text-sm text-slate-700">{t('settings.autoBackupBeforeImport')}</span>
            </label>
          </div>
        </SettingsCard>

        <SettingsCard icon="📁" title={t('settings.materialsTitle')} description={t('settings.materialsDescription')}>
          <SettingsInfoRow
            label={t('settings.materialsPath')}
            value={
              <span className="break-all font-mono text-xs">
                {settings?.materials_path ?? t('settings.materialsPathEmpty')}
              </span>
            }
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <SettingsActionButton
              onClick={() => settings?.materials_path && void openFolderPath(settings.materials_path)}
              disabled={busy || !settings?.materials_path}
            >
              📂 {t('settings.openMaterialsFolder')}
            </SettingsActionButton>
            <SettingsActionButton onClick={() => void handleChangeMaterialsFolder()} disabled={busy}>
              📁 {t('settings.changeMaterialsFolder')}
            </SettingsActionButton>
          </div>
        </SettingsCard>

        <SettingsCard icon="ℹ️" title={t('settings.systemTitle')} description={t('settings.systemDescription')}>
          <dl>
            <SettingsInfoRow label={t('settings.appVersion')} value={fileInfo.appVersion} />
            <SettingsInfoRow label={t('settings.sqliteVersion')} value={fileInfo.sqliteVersion} />
            <SettingsInfoRow label={t('settings.countSubjects')} value={fileInfo.counts.subjects} />
            <SettingsInfoRow label={t('settings.countSections')} value={fileInfo.counts.sections} />
            <SettingsInfoRow label={t('settings.countTopics')} value={fileInfo.counts.topics} />
            <SettingsInfoRow label={t('settings.countLessons')} value={fileInfo.counts.lessons} />
            <SettingsInfoRow label={t('settings.countMaterials')} value={fileInfo.counts.lessonResources} />
            <SettingsInfoRow label={t('settings.databaseSize')} value={formatFileSize(fileInfo.sizeBytes)} />
          </dl>
        </SettingsCard>
      </div>
    </div>
  );
}
