import { useEffect, useState } from 'react';
import { BilingualText } from '@/components/content/BilingualText';
import { useI18n } from '@/i18n';
import { previewLessonResource } from '@/services/resources';
import type { LessonResource } from '@/types/database';
import {
  fileNameFromResourceUrl,
  resolvePreviewObjectUrl,
  type ResourcePreviewPayload,
} from '@/utils/resourcePreview';

export function ResourcePreviewModal({
  resource,
  onClose,
}: {
  resource: LessonResource;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<ResourcePreviewPayload | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPayload(null);
    setObjectUrl(null);

    previewLessonResource(resource.url, resource.resource_type)
      .then((result) => {
        if (cancelled) return;
        setPayload(result);
        if (result.kind !== 'unsupported' && result.kind !== 'error') {
          setObjectUrl(resolvePreviewObjectUrl(result));
        }
      })
      .catch((err: Error) => {
        console.error('[ResourcePreview]', err);
        if (!cancelled) {
          setPayload({ kind: 'error', message: err.message });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resource]);

  useEffect(() => {
    return () => {
      if (objectUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resource-preview-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-surface-border px-5 py-4">
          <div className="min-w-0" id="resource-preview-title">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              {t('lessonStudio.resourcePreview')}
            </p>
            <BilingualText
              textPl={resource.title_pl}
              textUa={resource.title_ua}
              plClassName="mt-1 text-base font-semibold text-slate-900"
              uaClassName="text-sm text-slate-500"
            />
            <p className="mt-1 truncate text-xs text-slate-400">
              {fileNameFromResourceUrl(resource.url)} · {resource.resource_type}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-surface-border px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            {t('common.close')}
          </button>
        </div>

        <div className="min-h-[320px] flex-1 overflow-auto bg-surface-muted/30 p-4">
          {loading ? (
            <div className="flex h-80 items-center justify-center text-sm text-slate-400">
              {t('common.loading')}
            </div>
          ) : payload?.kind === 'unsupported' ? (
            <div className="flex h-80 items-center justify-center px-6 text-center">
              <p className="max-w-md text-sm leading-relaxed text-slate-600">
                {t('lessonStudio.resourcePreviewUnsupported')}
              </p>
            </div>
          ) : payload?.kind === 'error' ? (
            <div className="flex h-80 items-center justify-center px-6 text-center">
              <p className="max-w-md text-sm text-red-600">{payload.message}</p>
            </div>
          ) : payload?.kind === 'pdf' && objectUrl ? (
            <iframe
              title={resource.title_pl}
              src={objectUrl}
              className="h-[70vh] w-full rounded-lg border border-surface-border bg-white"
            />
          ) : payload?.kind === 'image' && objectUrl ? (
            <div className="flex h-[70vh] items-center justify-center">
              <img
                src={objectUrl}
                alt={resource.title_pl}
                className="max-h-full max-w-full rounded-lg border border-surface-border object-contain"
              />
            </div>
          ) : payload?.kind === 'html' && objectUrl ? (
            <iframe
              title={resource.title_pl}
              src={objectUrl}
              sandbox="allow-scripts allow-same-origin allow-popups"
              className="h-[70vh] w-full rounded-lg border border-surface-border bg-white"
            />
          ) : (
            <div className="flex h-80 items-center justify-center text-sm text-slate-400">
              {t('common.noResults')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
