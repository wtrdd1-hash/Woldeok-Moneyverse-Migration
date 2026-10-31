import { describe, expect, it } from 'vitest';
import { attentionStatusRows } from './status-response';

const row = (sourceKey: string, state: 'operational' | 'outage' | 'unknown') => ({
  sourceKey, displayName: sourceKey, state, detail: null, observedAt: null,
  freshnessState: state === 'unknown' ? 'unknown' as const : 'fresh' as const,
  ageMs: state === 'unknown' ? null : 0, policyVersion: 'status-v1' as const,
});

describe('public service attention list', () => {
  it('never treats unknown freshness as operational', () => {
    const all = [row('healthy_api', 'operational'), row('stale_api', 'unknown'), row('down_api', 'outage')];
    expect(attentionStatusRows(all).map((entry) => entry.sourceKey)).toEqual(['stale_api', 'down_api']);
    expect(all).toHaveLength(3);
  });
});
