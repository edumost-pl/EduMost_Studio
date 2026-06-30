import type { DocumentationSnapshot } from '@/types/documentation';

function getApi() {
  if (!window.edumost?.docs) {
    throw new Error('Documentation API is unavailable');
  }
  return window.edumost.docs;
}

export async function fetchDocumentationSnapshot(): Promise<DocumentationSnapshot> {
  return getApi().getSnapshot() as Promise<DocumentationSnapshot>;
}
