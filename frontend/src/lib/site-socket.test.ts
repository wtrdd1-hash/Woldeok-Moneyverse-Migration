import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Socket } from 'socket.io-client';
import {
  acquireSiteSocket,
  lastLobbyPermissions,
  lastOnlineCount,
  readOnlineCount,
  releaseSiteSocket,
  resetSiteSocket,
} from './site-socket';

/**
 * The point of sharing is that a page which mounts the lobby, the headcount
 * and the market opens one connection rather than three. Each connection
 * costs a handshake, each handshake costs a session lookup counted against a
 * per-minute budget, and exceeding it is what the browser reports as
 * `WebSocket connection failed`.
 */

interface Fake {
  readonly socket: Socket;
  readonly closed: () => number;
  readonly fire: (event: string, value?: unknown) => void;
}

function fakeSocket(): Fake {
  const listeners = new Map<string, Set<(value: unknown) => void>>();
  let closed = 0;
  const socket = {
    connected: false,
    on(event: string, listener: (value: unknown) => void) {
      const set = listeners.get(event) ?? new Set();
      set.add(listener);
      listeners.set(event, set);
      return socket;
    },
    off(event: string, listener: (value: unknown) => void) {
      listeners.get(event)?.delete(listener);
      return socket;
    },
    emit: () => socket,
    close() {
      closed += 1;
      return socket;
    },
  };
  return {
    socket: socket as unknown as Socket,
    closed: () => closed,
    fire: (event, value) => {
      for (const listener of listeners.get(event) ?? []) listener(value);
    },
  };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  resetSiteSocket();
  vi.useRealTimers();
});

describe('the shared socket', () => {
  it('connects once however many holders there are', () => {
    const fake = fakeSocket();
    const connect = vi.fn(() => fake.socket);

    const first = acquireSiteSocket(connect);
    const second = acquireSiteSocket(connect);

    expect(connect).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
  });

  it('stays open while any holder remains', () => {
    const fake = fakeSocket();
    acquireSiteSocket(() => fake.socket);
    acquireSiteSocket(() => fake.socket);

    releaseSiteSocket();
    vi.advanceTimersByTime(60_000);

    expect(fake.closed()).toBe(0);
  });

  it('closes once the last holder has let go and the grace has passed', () => {
    const fake = fakeSocket();
    acquireSiteSocket(() => fake.socket);

    releaseSiteSocket();
    expect(fake.closed(), 'closed before the grace elapsed').toBe(0);

    vi.advanceTimersByTime(60_000);
    expect(fake.closed()).toBe(1);
  });

  // Navigating between two pages that both use it unmounts the old tree
  // before mounting the new one. Closing in that gap would cost a handshake
  // for a connection that was about to be wanted again.
  it('survives a navigation that releases and re-acquires it', () => {
    const fake = fakeSocket();
    const connect = vi.fn(() => fake.socket);

    acquireSiteSocket(connect);
    releaseSiteSocket();
    vi.advanceTimersByTime(100);
    acquireSiteSocket(connect);
    vi.advanceTimersByTime(60_000);

    expect(connect).toHaveBeenCalledTimes(1);
    expect(fake.closed()).toBe(0);
  });

  it('connects again after it has really closed', () => {
    const first = fakeSocket();
    const second = fakeSocket();
    const connect = vi.fn(() => (connect.mock.calls.length === 1 ? first.socket : second.socket));

    acquireSiteSocket(connect);
    releaseSiteSocket();
    vi.advanceTimersByTime(60_000);
    const reopened = acquireSiteSocket(connect);

    expect(connect).toHaveBeenCalledTimes(2);
    expect(reopened).toBe(second.socket);
  });
});

describe('what a late holder can start from', () => {
  it('has no answer before the server has given one', () => {
    const fake = fakeSocket();
    acquireSiteSocket(() => fake.socket);

    expect(lastOnlineCount()).toBeNull();
    expect(lastLobbyPermissions()).toBeNull();
  });

  // A component mounting onto an already-open socket hears neither event
  // again: `online` comes when somebody moves, `lobby:permissions` once at
  // connection. Without this the headcount shows 확인 중 until the next person
  // arrives, and the composer stays disabled for a member entitled to type.
  it('keeps the last headcount and the permission the server sent', () => {
    const fake = fakeSocket();
    acquireSiteSocket(() => fake.socket);

    fake.fire('online', 3);
    fake.fire('lobby:permissions', { canChat: true });

    expect(lastOnlineCount()).toBe(3);
    expect(lastLobbyPermissions()).toBe(true);
  });

  it('forgets both when the socket goes', () => {
    const fake = fakeSocket();
    acquireSiteSocket(() => fake.socket);
    fake.fire('online', 3);
    fake.fire('lobby:permissions', { canChat: true });

    releaseSiteSocket();
    vi.advanceTimersByTime(60_000);

    expect(lastOnlineCount()).toBeNull();
    expect(lastLobbyPermissions()).toBeNull();
  });

  it('reads a permission payload as a grant only when it says so', () => {
    const fake = fakeSocket();
    acquireSiteSocket(() => fake.socket);

    fake.fire('lobby:permissions', {});
    expect(lastLobbyPermissions()).toBe(false);
  });
});

describe('readOnlineCount', () => {
  it('takes a whole number as it is', () => {
    expect(readOnlineCount(4)).toBe(4);
    expect(readOnlineCount('4')).toBe(4);
  });

  it('never reports a negative or fractional headcount', () => {
    expect(readOnlineCount(-2)).toBe(0);
    expect(readOnlineCount(2.7)).toBe(2);
  });

  it('reads anything that is not a number as nobody', () => {
    expect(readOnlineCount('lots')).toBe(0);
    expect(readOnlineCount(null)).toBe(0);
    expect(readOnlineCount(undefined)).toBe(0);
  });
});
