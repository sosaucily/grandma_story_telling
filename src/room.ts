import './style.css';
import type { Role } from './types';

const params = new URLSearchParams(window.location.search);
const role = params.get('role') as Role | null;

if (role === 'grandma') {
  import('./grandma').then(({ initGrandma }) => initGrandma());
} else if (role === 'eli') {
  import('./eli').then(({ initEli }) => initEli());
} else {
  window.location.href = '/';
}
