import type { SessionState, CursorState } from './types';

/**
 * Client-side module for reading/writing session state and cursor
 * via the /api/sync endpoint (backed by Upstash Redis).
 */

// ── Writers ──

export async function writeState(state: Omit<SessionState, 'updatedAt'>): Promise<void> {
  await fetch('/api/sync?key=state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  });
}

export async function writeCursor(x: number, y: number, visible: boolean): Promise<void> {
  await fetch('/api/sync?key=cursor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ x, y, visible }),
  });
}

// ── Pollers ──

export function startStatePolling(
  intervalMs: number,
  onChange: (state: SessionState) => void,
): () => void {
  let lastUpdatedAt = 0;
  let active = true;

  async function poll() {
    if (!active) return;
    try {
      const res = await fetch('/api/sync?key=state');
      const data: SessionState | null = await res.json();
      if (data && data.updatedAt > lastUpdatedAt) {
        lastUpdatedAt = data.updatedAt;
        onChange(data);
      }
    } catch {
      // Silently retry next interval
    }
    if (active) setTimeout(poll, intervalMs);
  }

  poll();
  return () => { active = false; };
}

export function startCursorPolling(
  intervalMs: number,
  onUpdate: (cursor: CursorState) => void,
): () => void {
  let lastUpdatedAt = 0;
  let active = true;

  async function poll() {
    if (!active) return;
    try {
      const res = await fetch('/api/sync?key=cursor');
      const data: CursorState | null = await res.json();
      if (data && data.updatedAt > lastUpdatedAt) {
        lastUpdatedAt = data.updatedAt;
        onUpdate(data);
      }
    } catch {
      // Silently retry next interval
    }
    if (active) setTimeout(poll, intervalMs);
  }

  poll();
  return () => { active = false; };
}
