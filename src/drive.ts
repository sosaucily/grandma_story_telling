import type { Book, Page } from './types';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const ROOT_FOLDER_ID = import.meta.env.VITE_DRIVE_FOLDER_ID;
const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';

interface DriveFile {
  id: string;
  name: string;
}

interface DriveListResponse {
  files: DriveFile[];
}

async function driveList(query: string, orderBy = 'name'): Promise<DriveFile[]> {
  const params = new URLSearchParams({
    q: query,
    fields: 'files(id,name)',
    orderBy,
    pageSize: '200',
    key: API_KEY,
  });

  const res = await fetch(`${DRIVE_API}?${params}`);
  if (!res.ok) {
    throw new Error(`Google Drive API error: ${res.status} ${res.statusText}`);
  }

  const data: DriveListResponse = await res.json();
  return data.files;
}

export async function listBooks(): Promise<Book[]> {
  const query = `'${ROOT_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  return driveList(query);
}

export async function listPages(bookFolderId: string): Promise<Page[]> {
  const query = `'${bookFolderId}' in parents and mimeType contains 'image/' and trashed = false`;
  return driveList(query);
}

export function getImageUrl(fileId: string): string {
  return `https://lh3.googleusercontent.com/d/${fileId}=s1600`;
}
