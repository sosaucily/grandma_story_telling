import type { Book, Page } from './types';

/**
 * All Google Drive access goes through our Vercel API routes.
 * The API key stays server-side — never exposed to the browser.
 */

export async function listBooks(): Promise<Book[]> {
  const res = await fetch('/api/books');
  if (!res.ok) throw new Error(`Failed to load books: ${res.statusText}`);
  return res.json();
}

export async function listPages(bookFolderId: string): Promise<Page[]> {
  const res = await fetch(`/api/pages?bookId=${encodeURIComponent(bookFolderId)}`);
  if (!res.ok) throw new Error(`Failed to load pages: ${res.statusText}`);
  return res.json();
}

/**
 * Returns a URL that serves the image directly.
 * The browser fetches it as a normal <img src> — no base64 conversion needed.
 */
export function getImageUrl(fileId: string): string {
  return `/api/image?id=${encodeURIComponent(fileId)}`;
}
