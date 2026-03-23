import type { SyncMessage } from './types';

declare class JitsiMeetExternalAPI {
  constructor(domain: string, options: Record<string, unknown>);
  addEventListener(event: string, handler: (data: unknown) => void): void;
  executeCommand(command: string, ...args: unknown[]): void;
  dispose(): void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: typeof JitsiMeetExternalAPI;
  }
}

const JITSI_DOMAIN = 'meet.jit.si';
const ROOM_PREFIX = 'grandma-story-time-';

interface JitsiCallbacks {
  onMessage: (msg: SyncMessage, senderId: string) => void;
  onParticipantJoined?: (id: string) => void;
  onParticipantLeft?: (id: string) => void;
  onReady?: () => void;
}

interface JitsiHandle {
  send: (msg: SyncMessage) => void;
  sendTo: (participantId: string, msg: SyncMessage) => void;
  dispose: () => void;
}

export function initJitsi(roomSuffix: string, displayName: string, callbacks: JitsiCallbacks): JitsiHandle {
  const roomName = ROOM_PREFIX + roomSuffix.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

  const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
    roomName,
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

  const participants: Set<string> = new Set();

  api.addEventListener('videoConferenceJoined', () => {
    // Ensure iframe has proper permissions for mobile
    const iframe = document.querySelector('#jitsi-container iframe') as HTMLIFrameElement | null;
    if (iframe) {
      iframe.setAttribute('allow', 'camera; microphone; autoplay; display-capture; fullscreen');
    }
    callbacks.onReady?.();
  });

  api.addEventListener('participantJoined', (event: unknown) => {
    const e = event as { id: string };
    participants.add(e.id);
    callbacks.onParticipantJoined?.(e.id);
  });

  api.addEventListener('participantLeft', (event: unknown) => {
    const e = event as { id: string };
    participants.delete(e.id);
    callbacks.onParticipantLeft?.(e.id);
  });

  api.addEventListener('endpointTextMessageReceived', (event: unknown) => {
    const e = event as { data: { senderInfo: { id: string }; eventData: { text: string } } };
    try {
      const msg: SyncMessage = JSON.parse(e.data.eventData.text);
      callbacks.onMessage(msg, e.data.senderInfo.id);
    } catch {
      // Ignore malformed messages
    }
  });

  function send(msg: SyncMessage) {
    const text = JSON.stringify(msg);
    for (const pid of participants) {
      api.executeCommand('sendEndpointTextMessage', pid, text);
    }
  }

  function sendTo(participantId: string, msg: SyncMessage) {
    api.executeCommand('sendEndpointTextMessage', participantId, JSON.stringify(msg));
  }

  return { send, sendTo, dispose: () => api.dispose() };
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
