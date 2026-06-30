import { useI18n } from '@/i18n';
import type { TranslationKey } from '@/i18n/types';

const TABS: {
  id: 'editor' | 'materials' | 'homework' | 'assessment' | 'notes' | 'history';
  key: TranslationKey;
  disabled?: boolean;
}[] = [
  { id: 'editor', key: 'lessonStudio.tabEditor' },
  { id: 'materials', key: 'lessonStudio.tabMaterials', disabled: true },
  { id: 'homework', key: 'lessonStudio.tabHomework', disabled: true },
  { id: 'assessment', key: 'lessonStudio.tabAssessment', disabled: true },
  { id: 'notes', key: 'lessonStudio.tabNotes', disabled: true },
  { id: 'history', key: 'lessonStudio.tabHistory', disabled: true },
];

export function LessonEditorTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: 'editor';
  onTabChange: (tab: 'editor') => void;
}) {
  const { t } = useI18n();

  return (
    <div className="shrink-0 border-b border-surface-border bg-white px-4 sm:px-6">
      <div className="flex flex-wrap gap-x-1 gap-y-1">
        {TABS.map((tab) => {
          const active = tab.id === activeTab;
          const disabled = tab.disabled;

          return (
            <button
              key={tab.id}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onTabChange(tab.id as 'editor')}
              className={[
                'relative px-3 py-3 text-sm font-medium transition-colors sm:px-4',
                disabled
                  ? 'cursor-not-allowed text-slate-300'
                  : active
                    ? 'text-brand-700'
                    : 'text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              <span className="whitespace-normal sm:whitespace-nowrap">
                {t(tab.key)}
                {disabled ? (
                  <span className="ml-1.5 inline-block rounded bg-surface-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-400">
                    {t('lessonStudio.comingSoon')}
                  </span>
                ) : null}
              </span>
              {active ? (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-600" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
