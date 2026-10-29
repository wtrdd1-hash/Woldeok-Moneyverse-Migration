import { describe, expect, it } from 'vitest';
import { statusAggregateState } from './status';

describe('status summary honors collector freshness', () => {
  it('never reports all-stale operational observations as healthy', () => {
    expect(statusAggregateState([{ state: 'operational', freshnessState: 'stale' }])).toBe('unknown');
    expect(statusAggregateState([{ state: 'operational', freshnessState: 'unknown' }])).toBe('unknown');
  });

  it('does not hide stale rows behind a fresh healthy observation', () => {
    expect(statusAggregateState([
      { state: 'operational', freshnessState: 'fresh' },
      { state: 'operational', freshnessState: 'stale' },
    ])).toBe('unknown');
  });

  it('preserves confirmed outage and degraded priorities', () => {
    expect(statusAggregateState([
      { state: 'outage', freshnessState: 'fresh' },
      { state: 'operational', freshnessState: 'stale' },
    ])).toBe('outage');
    expect(statusAggregateState([
      { state: 'degraded', freshnessState: 'fresh' },
      { state: 'operational', freshnessState: 'stale' },
    ])).toBe('degraded');
  });

  it('does not let stale outage masquerade as a current outage', () => {
    expect(statusAggregateState([{ state: 'outage', freshnessState: 'stale' }])).toBe('unknown');
  });

  it('retains healthy status only for fresh, valid observations', () => {
    expect(statusAggregateState([{ state: 'operational', freshnessState: 'fresh' }])).toBe('operational');
    expect(statusAggregateState([])).toBe('unknown');
    expect(statusAggregateState([{ state: 'not-a-state', freshnessState: 'fresh' }])).toBe('unknown');
  });
});
