import type { SyncMessage } from './types';

const THROTTLE_MS = 100; // ~10 messages/sec
const HIDE_AFTER_MS = 5000;

// ── Sender (Eli's side): track cursor and send normalized coords ──

export function startCursorBroadcast(
  container: HTMLElement,
  send: (msg: SyncMessage) => void,
) {
  let lastSent = 0;

  function emitPosition(clientX: number, clientY: number) {
    const now = Date.now();
    if (now - lastSent < THROTTLE_MS) return;
    lastSent = now;

    const rect = container.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    if (x < 0 || x > 1 || y < 0 || y > 1) return;

    send({ type: 'cursor-move', x, y });
  }

  container.addEventListener('mousemove', (e) => {
    emitPosition(e.clientX, e.clientY);
  });

  container.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    if (touch) emitPosition(touch.clientX, touch.clientY);
  }, { passive: true });
}

// ── Receiver (Grandma's side): render Eli's cursor on the book image ──

export function createCursorRenderer(container: HTMLElement): (msg: SyncMessage) => void {
  const el = document.createElement('div');
  el.id = 'eli-cursor';
  el.textContent = '👆';
  el.classList.add('hidden');
  container.appendChild(el);

  let hideTimer: ReturnType<typeof setTimeout> | null = null;

  return (msg: SyncMessage) => {
    if (msg.type === 'cursor-move') {
      el.style.left = `${msg.x * 100}%`;
      el.style.top = `${msg.y * 100}%`;
      el.classList.remove('hidden');

      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        el.classList.add('hidden');
      }, HIDE_AFTER_MS);
    } else if (msg.type === 'cursor-hide') {
      el.classList.add('hidden');
    }
  };
}
