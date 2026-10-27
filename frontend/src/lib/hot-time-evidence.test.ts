import { describe, expect, it } from 'vitest';
import { parseHotTimeEvidence } from './hot-time-evidence';

const event = {
  id: '11111111-1111-4111-8111-111111111111', buffKey: 'WORK_SALARY_BOOST_150',
  title: 'Verified', description: 'Registered event', multiplier: 1.5, targetDomain: 'work', active: true,
  startsAt: '2026-10-26T01:00:00.000Z', endsAt: '2026-10-28T01:00:00.000Z',
};
const base = { activeBuffs: [event], hasActiveHotTime: true, serverTime: '2026-10-27T04:00:00.000Z' };

describe('hot-time evidence contract', () => {
  it('accepts a verified active event', () => expect(parseHotTimeEvidence(base)?.activeBuffs).toHaveLength(1));
  it('accepts verified zero events', () => expect(parseHotTimeEvidence({ ...base, activeBuffs: [], hasActiveHotTime: false })?.activeBuffs).toHaveLength(0));
  it('rejects contradictory active count', () => expect(parseHotTimeEvidence({ ...base, hasActiveHotTime: false })).toBeNull());
  it('rejects expired events', () => expect(parseHotTimeEvidence({ ...base, activeBuffs: [{ ...event, endsAt: '2026-10-26T00:00:00Z' }] })).toBeNull());
  it('rejects future events', () => expect(parseHotTimeEvidence({ ...base, activeBuffs: [{ ...event, startsAt: '2026-10-28T00:00:00Z' }] })).toBeNull());
  it('rejects duplicates and malformed multipliers', () => {
    expect(parseHotTimeEvidence({ ...base, activeBuffs: [event, event] })).toBeNull();
    expect(parseHotTimeEvidence({ ...base, activeBuffs: [{ ...event, multiplier: '1.5' }] })).toBeNull();
  });
});
