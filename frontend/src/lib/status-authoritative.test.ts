import { describe, expect, it } from 'vitest';
import { overallState, statusFromSnapshot } from './status';

describe('statusFromSnapshot', () => {
  it('keeps only fresh, valid observations authoritative', () => {
    expect(statusFromSnapshot('operational', 'fresh')).toBe('operational');
    expect(statusFromSnapshot('outage', 'fresh')).toBe('outage');
    expect(statusFromSnapshot('degraded', 'fresh')).toBe('degraded');
    expect(statusFromSnapshot('invalid', 'fresh')).toBe('unknown');
  });

  it('never promotes stale, unknown or missing freshness to healthy', () => {
    expect(statusFromSnapshot('operational', 'stale')).toBe('unknown');
    expect(statusFromSnapshot('operational', 'unknown')).toBe('unknown');
    expect(statusFromSnapshot('operational', undefined)).toBe('unknown');
    expect(statusFromSnapshot('operational', 'unexpected')).toBe('unknown');
  });

  it('prevents a stale healthy snapshot from making the aggregate green', () => {
    expect(overallState([statusFromSnapshot('operational', 'stale'), statusFromSnapshot('operational', 'fresh')])).toBe('unknown');
    expect(overallState([statusFromSnapshot('outage', 'fresh'), statusFromSnapshot('operational', 'stale')])).toBe('outage');
    expect(overallState([statusFromSnapshot('operational', 'fresh')])).toBe('operational');
  });
});
