import { listBooks, listPages, getImageUrl } from './drive';
import { initJitsi, loadJitsiScript } from './jitsi';
import { createCursorRenderer } from './cursor';
import type { Book, Page, SyncMessage } from './types';

const SHARED_ROOM = 'family-reading';

interface GrandmaState {
  phase: 'picking' | 'reading';
  books: Book[];
  currentBook: Book | null;
  pages: Page[];
  currentPage: number;
  jitsi: ReturnType<typeof initJitsi> | null;
  cursorHandler: ((msg: SyncMessage) => void) | null;
}

const state: GrandmaState = {
  phase: 'picking',
  books: [],
  currentBook: null,
  pages: [],
  currentPage: 0,
  jitsi: null,
  cursorHandler: null,
};

export async function initGrandma() {
  const app = document.getElementById('app')!;

  // Show book picker with a jitsi container already present
  app.innerHTML = `
    <div class="book-picker">
      <h2>Pick a book to read!</h2>
      <div class="book-grid" id="book-grid">
        <div class="loading">Loading books...</div>
      </div>
    </div>
    <div id="jitsi-container"></div>
  `;

  // Load books and Jitsi in parallel
  const [books] = await Promise.all([
    listBooks().catch((err): Book[] => {
      document.getElementById('book-grid')!.innerHTML =
        `<p class="error">Could not load books: ${err instanceof Error ? err.message : err}</p>`;
      return [];
    }),
    loadJitsiScript().then(() => {
      state.jitsi = initJitsi(SHARED_ROOM, 'Grandma', {
        onMessage: (msg) => {
          if (msg.type === 'cursor-move' || msg.type === 'cursor-hide') {
            state.cursorHandler?.(msg);
          }
        },
        onParticipantJoined: (id) => {
          // Send current state to late joiners
          if (state.currentBook && state.pages.length > 0) {
            setTimeout(() => {
              state.jitsi?.sendTo(id, {
                type: 'page-sync',
                page: state.currentPage,
                totalPages: state.pages.length,
                bookId: state.currentBook!.id,
                bookName: state.currentBook!.name,
              });
            }, 500);
          }
        },
      });
    }),
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

  // Detach Jitsi iframe so we can move it
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

  // Re-attach Jitsi
  document.getElementById('jitsi-container')!.appendChild(jitsiContent);

  // Set up cursor renderer
  const pageContainer = document.getElementById('page-container')!;
  state.cursorHandler = createCursorRenderer(pageContainer);

  // Notify Eli that a book was selected
  state.jitsi?.send({
    type: 'book-selected',
    bookId: book.id,
    bookName: book.name,
  });

  // Load pages
  try {
    state.pages = await listPages(book.id);
    if (state.pages.length === 0) {
      pageContainer.innerHTML = '<p class="error">No pages found in this book.</p>';
      return;
    }
    showPage(0);
    setupControls();

    // Send initial page sync
    state.jitsi?.send({
      type: 'page-sync',
      page: 0,
      totalPages: state.pages.length,
      bookId: book.id,
      bookName: book.name,
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

  indicator.textContent = `Page ${index + 1} of ${state.pages.length}`;

  const prevBtn = document.getElementById('prev-btn') as HTMLButtonElement;
  const nextBtn = document.getElementById('next-btn') as HTMLButtonElement;
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === state.pages.length - 1;

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
  state.jitsi?.send({
    type: 'page-change',
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
    document.body.classList.remove('room-body');
    state.phase = 'picking';
    state.currentBook = null;
    state.pages = [];
    state.currentPage = 0;

    // Move Jitsi to the book picker view
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
