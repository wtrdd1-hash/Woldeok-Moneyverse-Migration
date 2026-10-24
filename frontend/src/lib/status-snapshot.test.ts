import { describe, expect, it } from 'vitest';
import { overallSnapshotState, statusSnapshot } from './status-freshness';

const now = Date.parse('2026-10-24T11:00:00.000Z');
const freshAt = new Date(now - 20_000).toISOString();
const staleAt = new Date(now - 150_000).toISOString();

const row = (
  state: string,
  freshnessState: 'fresh' | 'stale' | 'unknown',
  observedAt: string | null = freshAt,
) => ({ state, freshnessState, observedAt });

describe('status snapshot authority', () => {
  it('never reports all services healthy when the only healthy readings are stale', () => {
    expect(overallSnapshotState([row('operational', 'stale')], now)).toBe('unknown');
    expect(overallSnapshotState([row('operational', 'unknown')], now)).toBe('unknown');
  });

  it('treats an unverified source as unknown even alongside a healthy source', () => {
    expect(
      overallSnapshotState([row('operational', 'fresh'), row('operational', 'stale')], now),
    ).toBe('unknown');
  });

  it('preserves verified outages and degraded service in worst-first order', () => {
    expect(overallSnapshotState([row('outage', 'fresh'), row('operational', 'stale')], now)).toBe(
      'outage',
    );
    expect(overallSnapshotState([row('degraded', 'fresh'), row('operational', 'stale')], now)).toBe(
      'degraded',
    );
  });

  it('does not trust a fresh label when its timestamp is missing, expired, or in the future', () => {
    expect(statusSnapshot(row('operational', 'fresh', null), now)).toEqual({
      state: 'unknown',
      stale: true,
    });
    expect(statusSnapshot(row('operational', 'fresh', staleAt), now)).toEqual({
      state: 'unknown',
      stale: true,
    });
    expect(
      statusSnapshot(row('operational', 'fresh', new Date(now + 6_000).toISOString()), now),
    ).toEqual({ state: 'unknown', stale: true });
  });

  it('keeps recent verified operational data healthy and no rows unknown', () => {
    expect(statusSnapshot(row('operational', 'fresh'), now)).toEqual({
      state: 'operational',
      stale: false,
    });
    expect(overallSnapshotState([row('operational', 'fresh')], now)).toBe('operational');
    expect(overallSnapshotState([], now)).toBe('unknown');
  });
});
