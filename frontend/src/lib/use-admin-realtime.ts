'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { acquireSiteSocket, releaseSiteSocket } from '@/lib/site-socket';

export interface AdminRealtimeStats {
  readonly activeSessions?: number | undefined;
  readonly m2SupplyWld?: number | undefined;
  readonly volume24hWld?: number | undefined;
  readonly killSwitches?: Record<string, boolean> | undefined;
  readonly lastUpdated?: string | undefined;
}

class AdminMetricStore {
  private stats: AdminRealtimeStats | null = null;
  private readonly listeners = new Set<() => void>();

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  readonly get = (): AdminRealtimeStats | null => this.stats;

  apply(payload: unknown): void {
    if (!payload || typeof payload !== 'object') return;
    const raw = payload as { stats?: Record<string, unknown>; timestamp?: string };
    const statsObj = raw.stats ?? (raw as Record<string, unknown>);

    this.stats = {
      activeSessions: typeof statsObj.activeSessions === 'number' ? statsObj.activeSessions : undefined,
      m2SupplyWld: typeof statsObj.m2SupplyWld === 'number' ? statsObj.m2SupplyWld : undefined,
      volume24hWld: typeof statsObj.volume24hWld === 'number' ? statsObj.volume24hWld : undefined,
      killSwitches: (statsObj.killSwitches as Record<string, boolean>) || undefined,
      lastUpdated: raw.timestamp || new Date().toISOString(),
    };

    for (const listener of this.listeners) listener();
  }
}

const globalAdminStore = new AdminMetricStore();

/**
 * Hook to stream real-time metrics in the admin control tower.
 */
export function useAdminRealtime(fallback?: AdminRealtimeStats): AdminRealtimeStats | undefined {
  useEffect(() => {
    const socket = acquireSiteSocket();
    socket.emit('admin:subscribe');

    const handleStats = (payload: unknown) => {
      globalAdminStore.apply(payload);
    };

    socket.on('admin:stats', handleStats);

    return () => {
      socket.off('admin:stats', handleStats);
      if (socket.connected) socket.emit('admin:unsubscribe');
      releaseSiteSocket();
    };
  }, []);

  const live = useSyncExternalStore(
    globalAdminStore.subscribe,
    () => globalAdminStore.get(),
    () => null,
  );

  return live ?? fallback;
}
