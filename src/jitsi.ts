/**
 * Jitsi Meet — video chat only.
 * All state sync is handled by the /api/sync endpoint, not Jitsi data channels.
 */

declare class JitsiMeetExternalAPI {
  constructor(domain: string, options: Record<string, unknown>);
  addEventListener(event: string, handler: (data: unknown) => void): void;
  dispose(): void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: typeof JitsiMeetExternalAPI;
  }
}

const JITSI_DOMAIN = 'meet.jit.si';
const ROOM_NAME = 'grandma-story-time-family-reading';

export function initJitsi(displayName: string): { dispose: () => void } {
  const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
    roomName: ROOM_NAME,
    parentNode: document.getElementById('jitsi-container'),
    width: '100%',
    height: '100%',
    configOverwrite: {
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      prejoinPageEnabled: false,
      disableDeepLinking: true,
      toolbarButtons: ['microphone', 'camera', 'hangup'],
      hideConferenceSubject: true,
      hideConferenceTimer: true,
      disableInviteFunctions: true,
      notifications: [],
      p2p: { enabled: true },
    },
    interfaceConfigOverwrite: {
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      SHOW_BRAND_WATERMARK: false,
      SHOW_POWERED_BY: false,
      TOOLBAR_ALWAYS_VISIBLE: false,
      DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
      HIDE_INVITE_MORE_HEADER: true,
    },
    userInfo: { displayName },
  });

  // Set iframe permissions immediately — must happen before the browser
  // requests camera/mic access, not after videoConferenceJoined.
  const iframe = document.querySelector('#jitsi-container iframe') as HTMLIFrameElement | null;
  if (iframe) {
    iframe.setAttribute('allow', 'camera; microphone; autoplay; display-capture; fullscreen');
  }

  return { dispose: () => api.dispose() };
}

export function loadJitsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = `https://${JITSI_DOMAIN}/external_api.js`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Jitsi API'));
    document.head.appendChild(script);
  });
}
