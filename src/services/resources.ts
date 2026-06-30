import type { ResourcePreviewPayload } from '@/utils/resourcePreview';
import type { EduMostAPI } from '@/types/edumost-api';

function getApi(): EduMostAPI {
  if (!window.edumost) {
    throw new Error('window.edumost is not available');
  }
  return window.edumost;
}

export async function previewLessonResource(
  url: string,
  resourceType: string,
): Promise<ResourcePreviewPayload> {
  return getApi().lessonResources.preview(url, resourceType) as Promise<ResourcePreviewPayload>;
}

export async function downloadLessonResource(
  url: string,
  suggestedName?: string,
): Promise<{ ok: boolean; error?: string; cancelled?: boolean }> {
  return getApi().lessonResources.download(url, suggestedName) as Promise<{
    ok: boolean;
    error?: string;
    cancelled?: boolean;
  }>;
}
