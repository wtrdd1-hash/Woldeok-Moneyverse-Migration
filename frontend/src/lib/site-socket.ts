'use client';

import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

/**
 * One socket per tab, shared by everything that needs it.
 *
 * Three components opened their own: the lobby, the lobby's headcount, and
 * the market's price feed. The home page mounts the first two side by side,
 * so every visit to it cost two handshakes for one server, and each handshake
 * is a session lookup counted against a per-minute budget and a per-session
 * connection cap. Exceeding either is not a quiet degradation — Engine.IO
 * refuses before allocating a transport and the browser reports
 * `WebSocket connection failed`.
 *
 * Holders acquire and release rather than connect and close, and the socket
 * outlives its last holder briefly: navigating between two pages that both
 * use it unmounts the old tree before mounting the new one, and closing in
 * that gap would mean a fresh handshake for a connection that was about to be
 * wanted again.
 *
 * Because it is shared, a holder removes its own listeners on unmount and
 * must never close it.
 */

type Connect = () => Socket;

const defaultConnect: Connect = () =>
  io({
    // `tryAllTransports` is what makes listing polling mean anything. Without
    // it the client stops at the first transport that fails to open, so a
    // WebSocket a proxy will not upgrade is the end of the connection rather
    // than a fall back to long polling.
    transports: ['websocket', 'polling'],
    tryAllTransports: true,
  });

/** How long the socket outlives its last holder, to cover a navigation. */
const GRACE_MS = 3_000;

let shared: Socket | null = null;
let holders = 0;
let idle: ReturnType<typeof setTimeout> | null = null;
let online: number | null = null;
let canChat: boolean | null = null;

/** The lobby headcount, as an integer, or null for anything that is not one. */
export function readOnlineCount(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

/**
 * The last headcount this tab heard, or null if none has arrived.
 *
 * The server sends `online` when somebody joins or leaves. A component
 * mounting onto a socket that is already open would otherwise show 확인 중
 * until the next person moved, which on a quiet evening is a long time.
 */
export function lastOnlineCount(): number | null {
  return online;
}

/**
 * Whether the server has said this visitor may write, or null if it has not
 * said yet.
 *
 * `lobby:permissions` is sent once, when the socket connects. A composer
 * mounting onto a socket that is already open would never hear it and would
 * stay disabled for a member who is perfectly entitled to type — so the
 * answer is kept here rather than only in whoever happened to be listening.
 */
export function lastLobbyPermissions(): boolean | null {
  return canChat;
}

export function acquireSiteSocket(connect: Connect = defaultConnect): Socket {
  if (idle !== null) {
    clearTimeout(idle);
    idle = null;
  }
  holders += 1;
  if (shared === null) {
    online = null;
    canChat = null;
    const socket = connect();
    // The module's own listeners, not a holder's: they are what let a
    // component mounting later start from the current answer.
    socket.on('online', (value: unknown) => {
      online = readOnlineCount(value);
    });
    socket.on('lobby:permissions', (value: { canChat?: boolean }) => {
      canChat = value?.canChat === true;
    });
    shared = socket;
  }
  return shared;
}

export function releaseSiteSocket(): void {
  holders = Math.max(0, holders - 1);
  if (holders > 0 || shared === null || idle !== null) return;
  idle = setTimeout(() => {
    idle = null;
    if (holders > 0) return;
    shared?.close();
    shared = null;
    online = null;
    canChat = null;
  }, GRACE_MS);
}

/** Test seam. Drops the socket and the counters without waiting out the grace. */
export function resetSiteSocket(): void {
  if (idle !== null) {
    clearTimeout(idle);
    idle = null;
  }
  shared?.close();
  shared = null;
  holders = 0;
  online = null;
  canChat = null;
}
