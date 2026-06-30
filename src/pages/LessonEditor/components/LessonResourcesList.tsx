import { useState, type MouseEvent } from 'react';
import { BilingualText } from '@/components/content/BilingualText';
import { useI18n } from '@/i18n';
import { downloadLessonResource } from '@/services/resources';
import type { LessonResource } from '@/types/database';
import { fileNameFromResourceUrl } from '@/utils/resourcePreview';
import { ResourcePreviewModal } from './ResourcePreviewModal';

function resourceIcon(type: string): string {
  switch (type.toUpperCase()) {
    case 'PPTX':
      return '📊';
    case 'PDF':
      return '📄';
    case 'LINK':
      return '🔗';
    case 'HTML':
      return '🌐';
    default:
      return '📎';
  }
}

function resourceIconBg(type: string): string {
  switch (type.toUpperCase()) {
    case 'PPTX':
      return 'bg-orange-50 text-orange-600';
    case 'PDF':
      return 'bg-red-50 text-red-600';
    case 'LINK':
    case 'HTML':
      return 'bg-brand-50 text-brand-600';
    default:
      return 'bg-surface-muted text-slate-500';
  }
}

export function LessonResourcesList({ resources }: { resources: LessonResource[] }) {
  const { t } = useI18n();
  const [previewResource, setPreviewResource] = useState<LessonResource | null>(null);

  const handleDownload = async (
    event: MouseEvent<HTMLButtonElement>,
    resource: LessonResource,
  ) => {
    event.stopPropagation();
    try {
      const result = await downloadLessonResource(
        resource.url,
        fileNameFromResourceUrl(resource.url),
      );
      if (result.error) {
        console.error('[ResourceDownload]', result.error);
      }
    } catch (err) {
      console.error('[ResourceDownload]', err);
    }
  };

  if (resources.length === 0) {
    return <p className="text-sm text-slate-400">{t('common.noResults')}</p>;
  }

  return (
    <>
      <ul className="space-y-2">
        {resources.map((resource) => (
          <li
            key={resource.id}
            className="flex min-w-0 items-center gap-3 rounded-xl border border-surface-border bg-surface-muted/50 p-3 transition-colors hover:bg-surface-muted"
          >
            <button
              type="button"
              onClick={() => setPreviewResource(resource)}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-lg ${resourceIconBg(resource.resource_type)}`}
              >
                {resourceIcon(resource.resource_type)}
              </div>
              <div className="min-w-0 flex-1">
                <BilingualText
                  textPl={resource.title_pl}
                  textUa={resource.title_ua}
                  variant="compact"
                  plClassName="truncate text-sm font-medium text-slate-900"
                  uaClassName="truncate text-xs text-slate-500"
                />
                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {fileNameFromResourceUrl(resource.url)}
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={(event) => handleDownload(event, resource)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-surface-border bg-white text-slate-500 hover:border-brand-200 hover:text-brand-600"
              title={t('lessonStudio.resourceDownload')}
              aria-label={t('lessonStudio.resourceDownload')}
            >
              ↓
            </button>
          </li>
        ))}
      </ul>

      {previewResource ? (
        <ResourcePreviewModal
          resource={previewResource}
          onClose={() => setPreviewResource(null)}
        />
      ) : null}
    </>
  );
}
