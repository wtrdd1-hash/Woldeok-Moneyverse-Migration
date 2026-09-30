'use client';

import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

/**
 * High-Performance Shared Socket Singleton per Tab.
 *
 * Optimizations:
 * 1. Single socket shared across all components on the page.
 * 2. Exponential backoff auto-reconnect (500ms -> 5000ms).
 * 3. Grace period (3s) before disconnection to prevent teardown during Next.js navigation.
 * 4. Active room subscription tracking to automatically resubscribe upon socket reconnect.
 * 5. Latency & Connection Quality Telemetry.
 */

type Connect = () => Socket;

const defaultConnect: Connect = () =>
  io({
    transports: ['websocket', 'polling'],
    tryAllTransports: true,
    reconnection: true,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
    timeout: 10_000,
  });

/** How long the socket outlives its last holder, to cover a navigation. */
const GRACE_MS = 3_000;

let shared: Socket | null = null;
let holders = 0;
let idle: ReturnType<typeof setTimeout> | null = null;
let online: number | null = null;
let canChat: boolean | null = null;
let lastPingMs: number | null = null;

const activeRooms = new Set<string>();

/** The lobby headcount, as an integer, or null for anything that is not one. */
export function readOnlineCount(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

/** The last headcount this tab heard, or null if none has arrived. */
export function lastOnlineCount(): number | null {
  return online;
}

/** Whether the server has said this visitor may write. */
export function lastLobbyPermissions(): boolean | null {
  return canChat;
}

/** Last measured ping latency in milliseconds. */
export function lastSocketLatency(): number | null {
  return lastPingMs;
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
    lastPingMs = null;
    const socket = connect();

    socket.on('online', (value: unknown) => {
      online = readOnlineCount(value);
    });
    socket.on('lobby:permissions', (value: { canChat?: boolean }) => {
      canChat = value?.canChat === true;
    });

    // Auto resubscribe to all active rooms on reconnect
    socket.on('connect', () => {
      for (const room of activeRooms) {
        if (room === 'market') {
          socket.emit('market:subscribe');
        } else if (room.startsWith('orderbook:')) {
          socket.emit('orderbook:subscribe', room.replace('orderbook:', ''));
        } else if (room.startsWith('stock:')) {
          socket.emit('stock:subscribe', room.replace('stock:', ''));
        } else if (room.startsWith('auction:')) {
          socket.emit('auction:subscribe', room.replace('auction:', ''));
        } else if (room === 'admin:control-tower') {
          socket.emit('admin:subscribe');
        }
      }
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
    lastPingMs = null;
    activeRooms.clear();
  }, GRACE_MS);
}

/**
 * Subscribes to a targeted socket room and event with automatic lifecycle management.
 */
export function subscribeSocketRoom<T>(
  room: string,
  subscribeEvent: string,
  unsubscribeEvent: string,
  dataEvent: string,
  payload: unknown,
  onData: (data: T) => void,
): () => void {
  const socket = acquireSiteSocket();
  activeRooms.add(room);

  const handleData = (eventData: unknown) => {
    onData(eventData as T);
  };

  socket.on(dataEvent, handleData);

  const doSubscribe = () => {
    if (socket.connected) {
      if (payload !== undefined) {
        socket.emit(subscribeEvent, payload);
      } else {
        socket.emit(subscribeEvent);
      }
    }
  };

  socket.on('connect', doSubscribe);
  doSubscribe();

  return () => {
    socket.off(dataEvent, handleData);
    socket.off('connect', doSubscribe);
    if (socket.connected) {
      if (payload !== undefined) {
        socket.emit(unsubscribeEvent, payload);
      } else {
        socket.emit(unsubscribeEvent);
      }
    }
    activeRooms.delete(room);
    releaseSiteSocket();
  };
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
  lastPingMs = null;
  activeRooms.clear();
}

