import { describe, expect, it } from 'vitest';
import { STATUS_FRESHNESS_MS, statusWithFreshness } from './status-freshness';

describe('statusWithFreshness', () => {
  const now = Date.parse('2026-09-19T00:00:00.000Z');

  it('keeps a recent collector state authoritative', () => {
    expect(statusWithFreshness('operational', new Date(now - 30_000).toISOString(), now)).toEqual({ state: 'operational', stale: false });
  });

  it('refuses to present an old healthy snapshot as current', () => {
    expect(statusWithFreshness('operational', new Date(now - STATUS_FRESHNESS_MS - 1).toISOString(), now)).toEqual({ state: 'unknown', stale: true });
  });

  it('treats missing, invalid, and materially future timestamps as stale', () => {
    expect(statusWithFreshness('operational', null, now).stale).toBe(true);
    expect(statusWithFreshness('operational', 'not-a-date', now).stale).toBe(true);
    expect(statusWithFreshness('operational', new Date(now + 6_000).toISOString(), now).stale).toBe(true);
  });
});
