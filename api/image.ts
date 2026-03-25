import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = process.env.GOOGLE_API_KEY!;
const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fileId = req.query.id;
  if (!fileId || typeof fileId !== 'string') {
    return res.status(400).json({ error: 'Missing id parameter' });
  }

  const driveRes = await fetch(`${DRIVE_API}/${fileId}?alt=media&key=${API_KEY}`);
  if (!driveRes.ok) {
    return res.status(driveRes.status).json({ error: `Drive API: ${driveRes.statusText}` });
  }

  const contentType = driveRes.headers.get('content-type') || 'image/jpeg';
  const buffer = Buffer.from(await driveRes.arrayBuffer());

  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  return res.send(buffer);
}
