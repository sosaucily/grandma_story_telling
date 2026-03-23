import './style.css';
import { drawEli, drawGrandma } from './avatars';

function init() {
  const eliCanvas = createAvatarCanvas('avatar-eli');
  const grandmaCanvas = createAvatarCanvas('avatar-grandma');

  if (eliCanvas) drawEli(eliCanvas);
  if (grandmaCanvas) drawGrandma(grandmaCanvas);

  document.getElementById('btn-eli')?.addEventListener('click', () => {
    window.location.href = `room.html?role=eli`;
  });

  document.getElementById('btn-grandma')?.addEventListener('click', () => {
    window.location.href = `room.html?role=grandma`;
  });
}

function createAvatarCanvas(containerId: string): HTMLCanvasElement | null {
  const container = document.getElementById(containerId);
  if (!container) return null;

  const canvas = document.createElement('canvas');
  canvas.width = 360;
  canvas.height = 360;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);
  return canvas;
}

init();
