/**
 * Video chat via Daily.co Prebuilt.
 * Loads the Daily.js SDK from CDN and embeds a video call in #jitsi-container.
 */

declare const DailyIframe: {
  createFrame(
    parentEl: HTMLElement,
    options?: Record<string, unknown>,
  ): DailyCallFrame;
};

interface DailyCallFrame {
  join(options: { url: string; userName?: string }): Promise<void>;
  leave(): Promise<void>;
  destroy(): Promise<void>;
}

declare global {
  interface Window {
    DailyIframe: typeof DailyIframe;
  }
}

const ROOM_URL = import.meta.env.VITE_DAILY_ROOM_URL;

let callFrame: DailyCallFrame | null = null;

export function initVideo(displayName: string): { dispose: () => void } {
  const container = document.getElementById('jitsi-container')!;

  callFrame = window.DailyIframe.createFrame(container, {
    iframeStyle: {
      width: '100%',
      height: '100%',
      border: 'none',
      borderRadius: '14px',
    },
    showLeaveButton: false,
    showFullscreenButton: false,
  });

  callFrame.join({ url: ROOM_URL, userName: displayName });

  return {
    dispose: () => {
      callFrame?.destroy();
      callFrame = null;
    },
  };
}

export function loadVideoScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.DailyIframe) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@daily-co/daily-js';
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Daily.co SDK'));
    document.head.appendChild(script);
  });
}
