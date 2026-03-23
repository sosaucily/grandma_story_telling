import { listPages, getImageUrl } from './drive';
import { initJitsi, loadJitsiScript } from './jitsi';
import { startCursorBroadcast } from './cursor';
import type { Page, SyncMessage } from './types';

const SHARED_ROOM = 'family-reading';

interface EliState {
  pages: Page[];
  currentPage: number;
  currentBookId: string | null;
  jitsi: ReturnType<typeof initJitsi> | null;
}

const state: EliState = {
  pages: [],
  currentPage: 0,
  currentBookId: null,
  jitsi: null,
};

export async function initEli() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="waiting">
      <div class="spinner"></div>
      <p>Waiting for Grandma to pick a book...</p>
    </div>
    <div id="jitsi-container"></div>
  `;

  await loadJitsiScript();

  state.jitsi = initJitsi(SHARED_ROOM, 'Eli', {
    onMessage: (msg: SyncMessage) => {
      if (msg.type === 'page-sync') {
        loadBookAndShowPage(msg.bookId, msg.page);
      } else if (msg.type === 'page-change') {
        showPage(msg.page);
      } else if (msg.type === 'book-selected') {
        loadBookAndShowPage(msg.bookId, 0);
      }
    },
  });
}

async function loadBookAndShowPage(bookId: string, page: number) {
  // Only reload pages if book changed
  if (bookId !== state.currentBookId) {
    state.currentBookId = bookId;

    // Detach Jitsi to preserve it
    const jitsiContainer = document.getElementById('jitsi-container')!;
    const jitsiContent = document.createDocumentFragment();
    while (jitsiContainer.firstChild) {
      jitsiContent.appendChild(jitsiContainer.firstChild);
    }

    const app = document.getElementById('app')!;
    app.innerHTML = `
      <div id="page-container">
        <img id="book-page" src="" alt="Book page">
        <div id="page-loading" class="loading">Loading...</div>
      </div>
      <div id="jitsi-container"></div>
    `;
    document.body.classList.add('room-body');

    // Re-attach Jitsi
    document.getElementById('jitsi-container')!.appendChild(jitsiContent);

    try {
      state.pages = await listPages(bookId);

      // Start cursor broadcasting on the page container
      const pageContainer = document.getElementById('page-container')!;
      startCursorBroadcast(pageContainer, (msg) => state.jitsi?.send(msg));
    } catch (err) {
      document.getElementById('app')!.innerHTML =
        `<p class="error">Could not load book: ${err instanceof Error ? err.message : err}</p>`;
      return;
    }
  }

  showPage(page);
}

function showPage(index: number) {
  if (index < 0 || index >= state.pages.length) return;
  state.currentPage = index;

  const img = document.getElementById('book-page') as HTMLImageElement | null;
  const loading = document.getElementById('page-loading');
  if (!img || !loading) return;

  loading.style.display = 'block';
  img.style.opacity = '0';

  const url = getImageUrl(state.pages[index].id);
  img.onload = () => {
    loading.style.display = 'none';
    img.style.opacity = '1';
  };
  img.onerror = () => {
    loading.textContent = 'Failed to load image.';
  };
  img.src = url;
}
