import { listBooks, listPages, getImageUrl } from './drive';
import { initJitsi, loadJitsiScript } from './jitsi';
import { startCursorBroadcast } from './cursor';
import { startStatePolling } from './sync';
import type { Book, Page, SessionState } from './types';

interface EliState {
  phase: 'picking' | 'reading';
  books: Book[];
  pages: Page[];
  currentPage: number;
  currentBookId: string | null;
}

const state: EliState = {
  phase: 'picking',
  books: [],
  pages: [],
  currentPage: 0,
  currentBookId: null,
};

export async function initEli() {
  const app = document.getElementById('app')!;

  // Show book picker (read-only) with Jitsi container
  app.innerHTML = `
    <div class="book-picker">
      <h2>Tell Grandma which book you want!</h2>
      <div class="book-grid" id="book-grid">
        <div class="loading">Loading books...</div>
      </div>
    </div>
    <div id="jitsi-container"></div>
  `;

  // Load books and Jitsi in parallel
  const [books] = await Promise.all([
    listBooks().catch((): Book[] => {
      document.getElementById('book-grid')!.innerHTML =
        '<p class="error">Could not load books.</p>';
      return [];
    }),
    loadJitsiScript().then(() => initJitsi('Eli')),
  ]);

  state.books = books;
  renderBookGrid();

  // Start polling session state from Grandma
  startStatePolling(500, handleStateChange);
}

function renderBookGrid() {
  const grid = document.getElementById('book-grid')!;

  if (state.books.length === 0) {
    grid.innerHTML = '<p class="error">No books found.</p>';
    return;
  }

  grid.innerHTML = '';
  for (const book of state.books) {
    const card = document.createElement('div');
    card.className = 'book-card book-card-readonly';
    card.innerHTML = `<span class="book-title">${escapeHtml(book.name)}</span>`;
    grid.appendChild(card);
    loadCover(book.id, card);
  }
}

async function loadCover(bookId: string, card: HTMLElement) {
  try {
    const pages = await listPages(bookId);
    if (pages.length > 0) {
      const img = document.createElement('img');
      img.src = getImageUrl(pages[0].id);
      img.alt = 'Book cover';
      card.prepend(img);
    }
  } catch {
    // Silently fail
  }
}

async function handleStateChange(session: SessionState) {
  if (session.phase === 'reading' && session.bookId) {
    if (state.phase === 'picking' || session.bookId !== state.currentBookId) {
      await enterReadingView(session.bookId, session.page);
    } else if (session.page !== state.currentPage) {
      showPage(session.page);
    }
  } else if (session.phase === 'picking' && state.phase === 'reading') {
    returnToBookPicker();
  }
}

async function enterReadingView(bookId: string, page: number) {
  state.phase = 'reading';
  state.currentBookId = bookId;

  // Preserve Jitsi
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
  document.getElementById('jitsi-container')!.appendChild(jitsiContent);

  try {
    state.pages = await listPages(bookId);
    const pageContainer = document.getElementById('page-container')!;
    startCursorBroadcast(pageContainer);
  } catch (err) {
    document.getElementById('app')!.innerHTML =
      `<p class="error">Could not load book: ${err instanceof Error ? err.message : err}</p>`;
    return;
  }

  showPage(page);
}

function returnToBookPicker() {
  state.phase = 'picking';
  state.currentBookId = null;
  state.pages = [];
  state.currentPage = 0;
  document.body.classList.remove('room-body');

  // Preserve Jitsi
  const jitsiContainer = document.getElementById('jitsi-container')!;
  const jitsiContent = document.createDocumentFragment();
  while (jitsiContainer.firstChild) {
    jitsiContent.appendChild(jitsiContainer.firstChild);
  }

  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="book-picker">
      <h2>Tell Grandma which book you want!</h2>
      <div class="book-grid" id="book-grid">
        <div class="loading">Loading books...</div>
      </div>
    </div>
    <div id="jitsi-container"></div>
  `;
  document.getElementById('jitsi-container')!.appendChild(jitsiContent);
  renderBookGrid();
}

function showPage(index: number) {
  if (index < 0 || index >= state.pages.length) return;
  state.currentPage = index;

  const img = document.getElementById('book-page') as HTMLImageElement | null;
  const loading = document.getElementById('page-loading');
  if (!img || !loading) return;

  loading.style.display = 'block';
  loading.textContent = 'Loading...';
  img.style.opacity = '0';

  img.onload = () => {
    loading.style.display = 'none';
    img.style.opacity = '1';
  };
  img.onerror = () => {
    loading.textContent = 'Failed to load image.';
  };
  img.src = getImageUrl(state.pages[index].id);
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
