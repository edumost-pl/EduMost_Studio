import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';

export function HelpModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const navigate = useNavigate();

  const items = [
    {
      label: t('help.documentation'),
      icon: '📄',
      action: () => {
        onClose();
        navigate('/documentation');
      },
    },
    {
      label: t('help.hotkeys'),
      icon: '⌨️',
      action: () => {
        onClose();
        navigate('/documentation#hotkeys');
      },
    },
    {
      label: t('help.contacts'),
      icon: '✉️',
      action: () => {
        onClose();
        navigate('/documentation#contacts');
      },
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        className="w-full max-w-sm rounded-2xl border border-surface-border bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
          <h2 id="help-modal-title" className="text-lg font-semibold text-slate-900">
            {t('help.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('action.cancel')}
            className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
        <ul className="divide-y divide-surface-border px-2 py-2">
          {items.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                onClick={item.action}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
