import { asStatusState, overallState } from './status';
import type { StatusState } from './status';

/**
 * Status snapshots are collected every 30 seconds. Allow one missed interval
 * before refusing to present an old healthy snapshot as current.
 */
/**
 * Status snapshots are collected every 30 seconds. Allow three missed intervals
 * plus Next.js ISR cache buffer (30s) before refusing to present an old healthy snapshot.
 */
export const STATUS_FRESHNESS_MS = 120_000;

export function statusWithFreshness(
  state: string,
  observedAt: string | null,
  nowMs: number,
): { state: StatusState; stale: boolean } {
  if (!observedAt) return { state: 'unknown', stale: true };
  const observedMs = Date.parse(observedAt);
  const stale =
    !Number.isFinite(observedMs) ||
    observedMs > nowMs + 5_000 ||
    nowMs - observedMs > STATUS_FRESHNESS_MS;
  return { state: stale ? 'unknown' : asStatusState(state), stale };
}

export interface StatusSnapshotRow {
  readonly state: string;
  readonly freshnessState: 'fresh' | 'stale' | 'unknown';
  readonly observedAt: string | null;
}

/** A collector's reported freshness and its timestamp must both be trustworthy. */
export function statusSnapshot(
  row: StatusSnapshotRow,
  nowMs: number,
): { state: StatusState; stale: boolean } {
  if (row.freshnessState !== 'fresh') return { state: 'unknown', stale: true };
  return statusWithFreshness(row.state, row.observedAt, nowMs);
}

/** Unknown or expired snapshots must never contribute a green overall headline. */
export function overallSnapshotState(
  rows: readonly StatusSnapshotRow[],
  nowMs: number,
): StatusState {
  return overallState(rows.map((row) => statusSnapshot(row, nowMs).state));
}
