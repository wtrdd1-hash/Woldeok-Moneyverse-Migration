import { describe, expect, it } from 'vitest';
import { parseProgressionStageEvidence } from './stage-evidence';

const valid = {
  progression: {
    stage_code: 'early',
    reached_at: '2026-11-03T01:23:45.123456+00:00',
    next_stage_code: 'middle',
    next_requirements: { workCompletions: 12, jobLevel: 2, businesses: 0 },
  },
};

describe('owner progression stage source evidence', () => {
  it('accepts a verified SQL stage with exact requirements', () => {
    expect(parseProgressionStageEvidence(valid)).toEqual({ kind: 'verified', status: valid.progression });
  });
  it('preserves a verified uncomputed stage rather than fabricating starter', () => {
    expect(parseProgressionStageEvidence({ progression: null })).toEqual({ kind: 'verified', status: null });
  });
  it('preserves a future valid stage code without inventing its position', () => {
    const next = { ...valid.progression, stage_code: 'legendary_5' };
    expect(parseProgressionStageEvidence({ progression: next })).toEqual({ kind: 'verified', status: next });
  });
  it.each([
    null,
    undefined,
    {},
    { progression: undefined },
    { progression: [] },
    { progression: { ...valid.progression, stage_code: '' } },
    { progression: { ...valid.progression, stage_code: 7 } },
    { progression: { ...valid.progression, reached_at: 'not-a-date' } },
    { progression: { ...valid.progression, reached_at: '2026-11-03' } },
    { progression: { ...valid.progression, reached_at: '2026-02-30T10:00:00Z' } },
    { progression: { ...valid.progression, next_stage_code: 9 } },
    { progression: { ...valid.progression, next_requirements: [] } },
    { progression: { ...valid.progression, next_requirements: { jobLevel: -1 } } },
    { progression: { ...valid.progression, next_requirements: { jobLevel: 1.5 } } },
    { progression: { ...valid.progression, next_requirements: { jobLevel: '3' } } },
    { progression: { ...valid.progression, next_requirements: { jobLevel: Number.MAX_SAFE_INTEGER + 1 } } },
    { progression: { ...valid.progression, next_stage_code: null, next_requirements: { jobLevel: 1 } } },
    { progression: { ...valid.progression, next_stage_code: 'middle', next_requirements: null } },
  ])('refuses malformed or unverified source %j', (input) => {
    expect(parseProgressionStageEvidence(input)).toEqual({ kind: 'unavailable' });
  });
});
