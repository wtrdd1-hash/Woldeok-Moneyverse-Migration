import { overallState } from './status';
import { statusWithFreshness } from './status-freshness';
import type { StatusState } from './status';

export interface ServiceStatusRow {
  readonly state: string;
  readonly observedAt: string | null;
}

export interface ServiceImpact {
  readonly state: StatusState;
  readonly staleCount: number;
}

/**
 * Reduce the public status feed to the small amount of information the global
 * shell needs. Stale snapshots are deliberately unknown, never healthy.
 */
export function serviceImpact(rows: readonly ServiceStatusRow[], nowMs: number): ServiceImpact | null {
  if (rows.length === 0) return null;
  const snapshots = rows.map((row) => statusWithFreshness(row.state, row.observedAt, nowMs));
  const state = overallState(snapshots.map((snapshot) => snapshot.state));
  const staleCount = snapshots.filter((snapshot) => snapshot.stale).length;
  if (state === 'operational' && staleCount === 0) return null;
  return { state, staleCount };
}
