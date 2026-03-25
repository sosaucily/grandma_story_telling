import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = process.env.GOOGLE_API_KEY!;
const FOLDER_ID = process.env.DRIVE_FOLDER_ID!;
const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const query = `'${FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const params = new URLSearchParams({
    q: query,
    fields: 'files(id,name)',
    orderBy: 'name',
    pageSize: '200',
    key: API_KEY,
  });

  const driveRes = await fetch(`${DRIVE_API}?${params}`);
  if (!driveRes.ok) {
    return res.status(driveRes.status).json({ error: await driveRes.text() });
  }

  const data = await driveRes.json();
  res.setHeader('Cache-Control', 'public, s-maxage=300');
  return res.json(data.files || []);
}
