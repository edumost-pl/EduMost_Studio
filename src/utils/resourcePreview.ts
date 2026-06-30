export type ResourcePreviewKind = 'pdf' | 'image' | 'html' | 'unsupported';

export type ResourcePreviewPayload =
  | { kind: 'unsupported' }
  | { kind: 'error'; message: string }
  | { kind: 'pdf' | 'image' | 'html'; src: string }
  | { kind: 'pdf' | 'image' | 'html'; data: string; mime: string };

export function base64ToObjectUrl(base64: string, mime: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return URL.createObjectURL(new Blob([bytes], { type: mime }));
}

export function resolvePreviewObjectUrl(payload: ResourcePreviewPayload): string | null {
  if (payload.kind === 'unsupported' || payload.kind === 'error') {
    return null;
  }
  if ('src' in payload && payload.src) {
    return payload.src;
  }
  if ('data' in payload && payload.data && payload.mime) {
    return base64ToObjectUrl(payload.data, payload.mime);
  }
  return null;
}

export function fileNameFromResourceUrl(url: string): string {
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const parsed = new URL(url);
      const segment = parsed.pathname.split('/').filter(Boolean).pop();
      return segment ?? 'download';
    }
    const path = url.replace(/^file:\/\//, '');
    const parts = path.split(/[/\\]/);
    return parts[parts.length - 1] || 'download';
  } catch {
    return 'download';
  }
}
