import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const VALID_KEYS = ['state', 'cursor'] as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const key = req.query.key;
  if (!key || typeof key !== 'string' || !VALID_KEYS.includes(key as typeof VALID_KEYS[number])) {
    return res.status(400).json({ error: 'Missing or invalid key parameter (state or cursor)' });
  }

  const redisKey = `session:${key}`;

  if (req.method === 'GET') {
    const data = await redis.get(redisKey);
    // No caching — always fresh
    res.setHeader('Cache-Control', 'no-store');
    return res.json(data || null);
  }

  if (req.method === 'POST') {
    const body = req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Missing JSON body' });
    }

    body.updatedAt = Date.now();

    // State expires after 1 hour, cursor after 10 seconds
    const ttl = key === 'state' ? 3600 : 10;
    await redis.set(redisKey, body, { ex: ttl });

    return res.json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
