export type Role = 'grandma' | 'eli';

export interface Book {
  id: string;
  name: string;
}

export interface Page {
  id: string;
  name: string;
}

export interface SessionState {
  phase: 'picking' | 'reading';
  bookId?: string;
  bookName?: string;
  page: number;
  totalPages: number;
  updatedAt: number;
}

export interface CursorState {
  x: number;
  y: number;
  visible: boolean;
  updatedAt: number;
}
