import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type ResourcePreviewKind = 'pdf' | 'image' | 'html' | 'unsupported';

const MIME_BY_EXT: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.html': 'text/html',
  '.htm': 'text/html',
};

export function resolveResourcePreviewKind(
  resourceType: string,
  url: string,
): ResourcePreviewKind {
  const type = resourceType.toUpperCase();
  if (type === 'PPTX' || type === 'DOCX' || type === 'DOC' || type === 'PPT') {
    return 'unsupported';
  }
  if (type === 'PDF') return 'pdf';
  if (type === 'HTML') return 'html';
  if (type === 'LINK') return 'html';
  if (type === 'IMAGE') return 'image';

  const ext = path.extname(url.split('?')[0] ?? '').toLowerCase();
  if (ext === '.pdf') return 'pdf';
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)) {
    return 'image';
  }
  if (['.html', '.htm'].includes(ext)) return 'html';
  if (['.pptx', '.docx', '.doc', '.ppt', '.xlsx'].includes(ext)) {
    return 'unsupported';
  }

  return 'html';
}

export function fileNameFromResourceUrl(url: string): string {
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const parsed = new URL(url);
      const segment = parsed.pathname.split('/').filter(Boolean).pop();
      return segment ?? 'download';
    }
    const filePath = fileURLToPath(url);
    return path.basename(filePath);
  } catch {
    return 'download';
  }
}

export type ResourcePreviewPayload =
  | { kind: 'unsupported' }
  | { kind: 'error'; message: string }
  | { kind: 'pdf' | 'image' | 'html'; src: string }
  | { kind: 'pdf' | 'image' | 'html'; data: string; mime: string };

export function buildResourcePreviewPayload(
  url: string,
  resourceType: string,
): ResourcePreviewPayload {
  const kind = resolveResourcePreviewKind(resourceType, url);
  if (kind === 'unsupported') {
    return { kind: 'unsupported' };
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return { kind, src: url };
  }

  let filePath: string;
  try {
    filePath = fileURLToPath(url);
  } catch {
    return { kind: 'error', message: 'Invalid file URL' };
  }

  if (!fs.existsSync(filePath)) {
    return { kind: 'error', message: 'File not found' };
  }

  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_BY_EXT[ext] ?? 'application/octet-stream';
  const data = fs.readFileSync(filePath).toString('base64');

  return { kind, data, mime };
}
