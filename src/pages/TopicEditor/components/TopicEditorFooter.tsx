import { useI18n } from '@/i18n';

export function TopicEditorFooter({
  saving,
  isCreate,
  onCancel,
  onDelete,
  onSave,
}: {
  saving: boolean;
  isCreate?: boolean;
  onCancel: () => void;
  onDelete: () => void;
  onSave: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-surface-border bg-white px-6 py-4 shadow-panel">
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="rounded-xl border border-surface-border px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        {t('editor.cancel')}
      </button>
      {!isCreate ? (
        <button
          type="button"
          onClick={onDelete}
          disabled={saving}
          className="rounded-xl border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {t('editor.deleteTopic')}
        </button>
      ) : null}
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {saving ? t('common.loading') : isCreate ? t('action.save') : t('editor.saveChanges')}
      </button>
    </div>
  );
}
