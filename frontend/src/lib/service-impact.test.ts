import { describe, expect, it } from 'vitest';
import { serviceImpact } from './service-impact';

const NOW = Date.parse('2026-09-19T00:00:00.000Z');
const recent = (state: string) => ({ state, observedAt: new Date(NOW - 10_000).toISOString() });

describe('serviceImpact', () => {
  it('stays silent when every fresh source is operational', () => {
    expect(serviceImpact([recent('operational'), recent('operational')], NOW)).toBeNull();
  });

  it('surfaces the worst current service state', () => {
    expect(serviceImpact([recent('degraded'), recent('outage')], NOW)).toEqual({
      state: 'outage',
      staleCount: 0,
    });
  });

  it('never turns a stale healthy snapshot into a global green state', () => {
    expect(serviceImpact([{ state: 'operational', observedAt: new Date(NOW - 61_000).toISOString() }], NOW)).toEqual({
      state: 'unknown',
      staleCount: 1,
    });
  });

  it('does not show an impact banner when the collector has no rows yet', () => {
    expect(serviceImpact([], NOW)).toBeNull();
  });
});
