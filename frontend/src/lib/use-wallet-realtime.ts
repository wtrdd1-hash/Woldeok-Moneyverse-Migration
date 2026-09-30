'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { acquireSiteSocket, releaseSiteSocket } from '@/lib/site-socket';

export interface RealtimeWalletState {
  readonly availableWld?: number | undefined;
  readonly lockedInStocksWld?: number | undefined;
  readonly totalNetWorthWld?: number | undefined;
  readonly lastUpdated?: string | undefined;
}

interface InAppPushNotification {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly type?: 'info' | 'success' | 'warning' | 'alert';
  readonly href?: string;
  readonly sentAt?: string;
}

class UserWalletStore {
  private state: RealtimeWalletState | null = null;
  private readonly listeners = new Set<() => void>();

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  readonly get = (): RealtimeWalletState | null => this.state;

  apply(payload: unknown): void {
    if (!payload || typeof payload !== 'object') return;
    const raw = payload as Record<string, unknown>;
    const available = typeof raw.availableWld === 'number' ? raw.availableWld : undefined;
    const locked = typeof raw.lockedInStocksWld === 'number' ? raw.lockedInStocksWld : undefined;
    const total = typeof raw.totalNetWorthWld === 'number' ? raw.totalNetWorthWld : undefined;

    this.state = {
      availableWld: available,
      lockedInStocksWld: locked,
      totalNetWorthWld: total,
      lastUpdated: new Date().toISOString(),
    };

    for (const listener of this.listeners) listener();
  }
}

const globalWalletStore = new UserWalletStore();

/**
 * Hook to get real-time WLD balance and automatically receive in-app push notifications.
 */
export function useRealtimeWallet(fallbackBalance?: number): {
  readonly availableWld: number | undefined;
  readonly totalNetWorthWld: number | undefined;
  readonly lastUpdated: string | undefined;
} {
  useEffect(() => {
    const socket = acquireSiteSocket();

    const handleBalance = (payload: unknown) => {
      globalWalletStore.apply(payload);
    };

    const handlePush = (payload: unknown) => {
      if (!payload || typeof payload !== 'object') return;
      const notif = payload as InAppPushNotification;
      if (!notif.title || !notif.message) return;

      if (notif.type === 'success') {
        toast.success(notif.title, { description: notif.message });
      } else if (notif.type === 'warning' || notif.type === 'alert') {
        toast.warning(notif.title, { description: notif.message });
      } else {
        toast.info(notif.title, { description: notif.message });
      }
    };

    socket.on('wallet:balance', handleBalance);
    socket.on('notification:push', handlePush);

    return () => {
      socket.off('wallet:balance', handleBalance);
      socket.off('notification:push', handlePush);
      releaseSiteSocket();
    };
  }, []);

  const live = useSyncExternalStore(
    globalWalletStore.subscribe,
    () => globalWalletStore.get(),
    () => null,
  );

  return {
    availableWld: live?.availableWld ?? fallbackBalance,
    totalNetWorthWld: live?.totalNetWorthWld,
    lastUpdated: live?.lastUpdated,
  };
}
