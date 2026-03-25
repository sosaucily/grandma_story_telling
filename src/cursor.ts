import { writeCursor, startCursorPolling } from './sync';
import type { CursorState } from './types';

const THROTTLE_MS = 300; // ~3 writes/sec to conserve Redis quota
const HIDE_AFTER_MS = 5000;

// ── Sender (Eli's side): track cursor and write to API ──

export function startCursorBroadcast(container: HTMLElement) {
  let lastSent = 0;

  function emitPosition(clientX: number, clientY: number) {
    const now = Date.now();
    if (now - lastSent < THROTTLE_MS) return;
    lastSent = now;

    const rect = container.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    if (x < 0 || x > 1 || y < 0 || y > 1) return;

    writeCursor(x, y, true);
  }

  container.addEventListener('mousemove', (e) => {
    emitPosition(e.clientX, e.clientY);
  });

  container.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    if (touch) emitPosition(touch.clientX, touch.clientY);
  }, { passive: true });
}

// ── Receiver (Grandma's side): render Eli's cursor via polling ──

export function createCursorRenderer(container: HTMLElement): () => void {
  const el = document.createElement('div');
  el.id = 'eli-cursor';
  el.textContent = '👆';
  el.classList.add('hidden');
  container.appendChild(el);

  let hideTimer: ReturnType<typeof setTimeout> | null = null;

  const stopPolling = startCursorPolling(300, (cursor: CursorState) => {
    if (cursor.visible) {
      el.style.left = `${cursor.x * 100}%`;
      el.style.top = `${cursor.y * 100}%`;
      el.classList.remove('hidden');

      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        el.classList.add('hidden');
      }, HIDE_AFTER_MS);
    } else {
      el.classList.add('hidden');
    }
  });

  return stopPolling;
}
