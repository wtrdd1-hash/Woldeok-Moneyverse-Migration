import { describe, expect, it } from 'vitest';
import { getCockpitEvidence } from './admin-cockpit-evidence';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const member = (n: number, amount: string, rank: number | null = n) => ({
  user_id: id(n), status: 'active', display_name: `Member ${n}`, created_at: '2026-10-01T00:00:00Z',
  restricted_at: null, restriction_reason: null, total_net_worth: amount, wealth_rank: rank, is_admin: false,
});
const valid = () => ({
  controls: { featureSwitches: [{ feature_key: 'work', state: 'enabled' }] },
  stocks: { stocks: [{ id: id(1), active: true, halt_status: 'active' }] },
  users: { users: [member(1, '9007199254740993')] },
  health: { available: true, calculatedAt: '2026-10-27T08:00:00Z', integrity: {
    ok: true, ledgerTransactionCount: '5', unbalancedTransactionCount: '0',
    balanceMismatchAccountCount: '0', balanceTotalDeltaAmount: '0',
  } },
});

describe('administrator cockpit authoritative evidence', () => {
  it('does not invent healthy switches, markets, members or reconciliations when APIs fail', () => {
    const result = getCockpitEvidence({ controls: null, stocks: null, users: null, health: null });
    expect(result.controls).toEqual({ state: 'unavailable' });
    expect(result.stocks).toEqual({ state: 'unavailable' });
    expect(result.members).toEqual({ state: 'unavailable' });
    expect(result.ledger).toEqual({ state: 'unavailable' });
    expect(result.allVerified).toBe(false);
  });

  it('accepts actual zero-row responses but does not imply a global population', () => {
    const data = valid();
    const result = getCockpitEvidence({ ...data, users: { users: [] }, stocks: { stocks: [] } });
    expect(result.members).toMatchObject({ state: 'verified', sampledCount: 0 });
    expect(result.stocks).toMatchObject({ state: 'verified', active: 0, halted: 0 });
    expect(result.allVerified).toBe(true);
  });

  it('treats the bounded member directory as a sample and preserves exact large WLD amounts', () => {
    const data = valid();
    const users = Array.from({ length: 100 }, (_, i) => member(i + 1, i === 0 ? '9007199254740993' : String(100 - i)));
    const result = getCockpitEvidence({ ...data, users: { users } });
    expect(result.members.state).toBe('verified');
    if (result.members.state !== 'verified') throw new Error('missing member evidence');
    expect(result.members.sampledCount).toBe(100);
    expect(result.members.top[0]?.total_net_worth).toBe('9007199254740993');
    expect(result.members.top).toHaveLength(5);
  });

  it('rejects invalid financial amounts, duplicate members and unsafe ranks', () => {
    const data = valid();
    expect(getCockpitEvidence({ ...data, users: { users: [member(1, '9007199254740993'), member(1, '2')] } }).members.state).toBe('unavailable');
    expect(getCockpitEvidence({ ...data, users: { users: [member(1, '1.5')] } }).members.state).toBe('unavailable');
    expect(getCockpitEvidence({ ...data, users: { users: [member(1, '1', Number.MAX_SAFE_INTEGER + 1)] } }).members.state).toBe('unavailable');
  });

  it('rejects contradictory or malformed control and stock responses', () => {
    const data = valid();
    expect(getCockpitEvidence({ ...data, controls: { featureSwitches: [{ feature_key: 'work', state: 'enabled' }, { feature_key: 'work', state: 'paused' }] } }).controls.state).toBe('unavailable');
    expect(getCockpitEvidence({ ...data, stocks: { stocks: [{ id: id(1), active: 'yes' }] } }).stocks.state).toBe('unavailable');
    expect(getCockpitEvidence({ ...data, controls: { featureSwitches: [{ feature_key: 'work', state: 'unknown' }] } }).controls.state).toBe('unavailable');
  });

  it('never calls a missing or contradictory ledger reconciliation verified', () => {
    const data = valid();
    expect(getCockpitEvidence({ ...data, health: { available: false, integrity: { ok: true } } }).ledger.state).toBe('unavailable');
    expect(getCockpitEvidence({ ...data, health: { ...data.health, calculatedAt: 'invalid-date' } }).ledger.state).toBe('unavailable');
    expect(getCockpitEvidence({ ...data, health: { ...data.health, integrity: { ...data.health.integrity, unbalancedTransactionCount: '1' } } }).ledger.state).toBe('unavailable');
    expect(getCockpitEvidence({ ...data, health: { ...data.health, integrity: { ...data.health.integrity, ok: false } } }).ledger.state).toBe('mismatch');
  });
});
