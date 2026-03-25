import { listBooks, listPages, getImageUrl } from './drive';
import { initVideo, loadVideoScript } from './jitsi';
import { createCursorRenderer } from './cursor';
import { writeState } from './sync';
import type { Book, Page } from './types';

interface GrandmaState {
  phase: 'picking' | 'reading';
  books: Book[];
  currentBook: Book | null;
  pages: Page[];
  currentPage: number;
  stopCursorPolling: (() => void) | null;
}

const state: GrandmaState = {
  phase: 'picking',
  books: [],
  currentBook: null,
  pages: [],
  currentPage: 0,
  stopCursorPolling: null,
};

export async function initGrandma() {
  const app = document.getElementById('app')!;

  // Show book picker with Jitsi container (video starts on this page)
  app.innerHTML = `
    <div class="book-picker">
      <h2>Pick a book to read!</h2>
      <div class="book-grid" id="book-grid">
        <div class="loading">Loading books...</div>
      </div>
    </div>
    <div id="jitsi-container"></div>
  `;

  // Write initial state so Eli knows we're on the picker
  writeState({ phase: 'picking', page: 0, totalPages: 0 });

  // Load books and Jitsi in parallel
  const [books] = await Promise.all([
    listBooks().catch((err): Book[] => {
      document.getElementById('book-grid')!.innerHTML =
        `<p class="error">Could not load books: ${err instanceof Error ? err.message : err}</p>`;
      return [];
    }),
    loadVideoScript().then(() => initVideo('Grandma')),
  ]);

  state.books = books;
  renderBookGrid();
}

function renderBookGrid() {
  const grid = document.getElementById('book-grid')!;

  if (state.books.length === 0) {
    grid.innerHTML = '<p class="error">No books found. Make sure your Google Drive folder is shared publicly and contains subfolders.</p>';
    return;
  }

  grid.innerHTML = '';
  for (const book of state.books) {
    const card = document.createElement('button');
    card.className = 'book-card';
    card.innerHTML = `<span class="book-title">${escapeHtml(book.name)}</span>`;
    card.addEventListener('click', () => selectBook(book));
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

async function selectBook(book: Book) {
  state.currentBook = book;
  state.phase = 'reading';

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
    <div id="controls">
      <button id="back-btn">Back</button>
      <button id="prev-btn" disabled>Previous</button>
      <span id="page-indicator"></span>
      <button id="next-btn" disabled>Next</button>
    </div>
    <div id="jitsi-container"></div>
  `;
  document.body.classList.add('room-body');
  document.getElementById('jitsi-container')!.appendChild(jitsiContent);

  // Set up cursor renderer (polls Redis for Eli's cursor)
  const pageContainer = document.getElementById('page-container')!;
  state.stopCursorPolling = createCursorRenderer(pageContainer);

  // Load pages
  try {
    state.pages = await listPages(book.id);
    if (state.pages.length === 0) {
      pageContainer.innerHTML = '<p class="error">No pages found in this book.</p>';
      return;
    }
    showPage(0);
    setupControls();

    // Write state so Eli knows which book and page
    writeState({
      phase: 'reading',
      bookId: book.id,
      bookName: book.name,
      page: 0,
      totalPages: state.pages.length,
    });
  } catch (err) {
    pageContainer.innerHTML = `<p class="error">Could not load pages: ${err instanceof Error ? err.message : err}</p>`;
  }
}

function showPage(index: number) {
  if (index < 0 || index >= state.pages.length) return;
  state.currentPage = index;

  const img = document.getElementById('book-page') as HTMLImageElement;
  const loading = document.getElementById('page-loading')!;
  const indicator = document.getElementById('page-indicator')!;

  loading.style.display = 'block';
  loading.textContent = 'Loading...';
  img.style.opacity = '0';

  indicator.textContent = `Page ${index + 1} of ${state.pages.length}`;

  const prevBtn = document.getElementById('prev-btn') as HTMLButtonElement;
  const nextBtn = document.getElementById('next-btn') as HTMLButtonElement;
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === state.pages.length - 1;

  img.onload = () => {
    loading.style.display = 'none';
    img.style.opacity = '1';
  };
  img.onerror = () => {
    loading.textContent = 'Failed to load image.';
  };
  img.src = getImageUrl(state.pages[index].id);

  // Preload adjacent pages
  for (const adj of [index - 1, index + 1]) {
    if (adj >= 0 && adj < state.pages.length) {
      const preload = new Image();
      preload.src = getImageUrl(state.pages[adj].id);
    }
  }
}

function changePage(newPage: number) {
  showPage(newPage);

  // Write updated page to Redis so Eli syncs
  writeState({
    phase: 'reading',
    bookId: state.currentBook!.id,
    bookName: state.currentBook!.name,
    page: state.currentPage,
    totalPages: state.pages.length,
  });
}

function setupControls() {
  document.getElementById('prev-btn')!.addEventListener('click', () => {
    if (state.currentPage > 0) changePage(state.currentPage - 1);
  });
  document.getElementById('next-btn')!.addEventListener('click', () => {
    if (state.currentPage < state.pages.length - 1) changePage(state.currentPage + 1);
  });
  document.getElementById('back-btn')!.addEventListener('click', () => {
    // Stop cursor polling
    state.stopCursorPolling?.();
    state.stopCursorPolling = null;

    document.body.classList.remove('room-body');
    state.phase = 'picking';
    state.currentBook = null;
    state.pages = [];
    state.currentPage = 0;

    // Write state so Eli returns to book picker too
    writeState({ phase: 'picking', page: 0, totalPages: 0 });

    // Preserve Jitsi
    const jitsiContainer = document.getElementById('jitsi-container')!;
    const jitsiContent = document.createDocumentFragment();
    while (jitsiContainer.firstChild) {
      jitsiContent.appendChild(jitsiContainer.firstChild);
    }

    const app = document.getElementById('app')!;
    app.innerHTML = `
      <div class="book-picker">
        <h2>Pick a book to read!</h2>
        <div class="book-grid" id="book-grid">
          <div class="loading">Loading books...</div>
        </div>
      </div>
      <div id="jitsi-container"></div>
    `;
    document.getElementById('jitsi-container')!.appendChild(jitsiContent);
    renderBookGrid();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (state.phase !== 'reading') return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      if (state.currentPage > 0) changePage(state.currentPage - 1);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
      if (state.currentPage < state.pages.length - 1) changePage(state.currentPage + 1);
    }
  });

  // Swipe gestures
  const container = document.getElementById('page-container')!;
  let touchStartX = 0;
  container.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  container.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && state.currentPage < state.pages.length - 1) {
        changePage(state.currentPage + 1);
      } else if (diff < 0 && state.currentPage > 0) {
        changePage(state.currentPage - 1);
      }
    }
  }, { passive: true });
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
