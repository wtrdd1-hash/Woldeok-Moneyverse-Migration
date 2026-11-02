import { describe, expect, it } from 'vitest';
import { parseHotTimeEvidence, parseCurrentHotTimeEvidence } from './hot-time-evidence';

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


describe('live hot-time freshness boundary', () => {
  const serverMs = Date.parse(base.serverTime);
  it('rejects a stale or future-dated snapshot even if the server marked buffs active', () => {
    expect(parseCurrentHotTimeEvidence(base, serverMs + 120_001)).toBeNull();
    expect(parseCurrentHotTimeEvidence(base, serverMs - 30_001)).toBeNull();
  });

  it('accepts the bounded current snapshot and verified empty response', () => {
    expect(parseCurrentHotTimeEvidence(base, serverMs + 120_000)?.activeBuffs).toHaveLength(1);
    expect(parseCurrentHotTimeEvidence(base, serverMs - 30_000)?.activeBuffs).toHaveLength(1);
    expect(parseCurrentHotTimeEvidence({ ...base, activeBuffs: [], hasActiveHotTime: false }, serverMs)).toEqual({ ...base, activeBuffs: [], hasActiveHotTime: false });
  });

  it('rejects buffs expired at actual display time, not just at server snapshot time', () => {
    const short = { ...event, endsAt: '2026-10-27T04:00:30.000Z' };
    expect(parseHotTimeEvidence({ ...base, activeBuffs: [short] })).not.toBeNull();
    expect(parseCurrentHotTimeEvidence({ ...base, activeBuffs: [short] }, serverMs + 60_000)).toBeNull();
  });

  it('does not trust malformed time or contradictory API payloads', () => {
    expect(parseCurrentHotTimeEvidence({ ...base, serverTime: 'not-a-date' }, serverMs)).toBeNull();
    expect(parseCurrentHotTimeEvidence({ ...base, hasActiveHotTime: false }, serverMs)).toBeNull();
    expect(parseCurrentHotTimeEvidence(base, Number.NaN)).toBeNull();
  });
});
