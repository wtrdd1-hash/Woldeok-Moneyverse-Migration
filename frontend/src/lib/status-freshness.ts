import { asStatusState } from './status';
import type { StatusState } from './status';

/**
 * Status snapshots are collected every 30 seconds. Allow one missed interval
 * before refusing to present an old healthy snapshot as current.
 */
export const STATUS_FRESHNESS_MS = 60_000;

export function statusWithFreshness(
  state: string,
  observedAt: string | null,
  nowMs: number,
): { state: StatusState; stale: boolean } {
  if (!observedAt) return { state: 'unknown', stale: true };
  const observedMs = Date.parse(observedAt);
  const stale = !Number.isFinite(observedMs) || observedMs > nowMs + 5_000 || nowMs - observedMs > STATUS_FRESHNESS_MS;
  return { state: stale ? 'unknown' : asStatusState(state), stale };
}
