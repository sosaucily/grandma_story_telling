export type Role = 'grandma' | 'eli';

export interface Book {
  id: string;
  name: string;
}

export interface Page {
  id: string;
  name: string;
}

export type SyncMessage =
  | { type: 'book-selected'; bookId: string; bookName: string }
  | { type: 'page-change'; page: number; totalPages: number }
  | { type: 'page-sync'; page: number; totalPages: number; bookId: string; bookName: string }
  | { type: 'cursor-move'; x: number; y: number }
  | { type: 'cursor-hide' };
