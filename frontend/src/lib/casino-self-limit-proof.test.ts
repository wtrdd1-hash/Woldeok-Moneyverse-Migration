import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { verifyCasinoSelfLimit } from './casino-self-limit-proof';

const requested = { dailyBetLimit: 1500, dailyLossLimit: 500, lockedUntil: null } as const;
const saved = { daily_bet_limit: '1500', daily_loss_limit: '500', locked_until: null };

describe('casino self-limit persistence proof', () => {
  it('accepts only matching write and authenticated read receipts', () => {
    expect(verifyCasinoSelfLimit(requested, saved, saved)).toEqual(saved);
  });

  it.each([
    [null, saved],
    [{ ...saved, daily_bet_limit: '999' }, saved],
    [{ ...saved, daily_bet_limit: 1500 }, saved],
    [saved, { ...saved, daily_loss_limit: '600' }],
    [saved, { ...saved, locked_until: '2026-10-30T00:00:00Z' }],
    [saved, null],
    [saved, { ...saved, daily_bet_limit: '1500.0' }],
  ])('rejects missing or contradictory receipts', (write, read) => {
    expect(() => verifyCasinoSelfLimit(requested, write, read)).toThrow(/casino self-limit/);
  });

  it('matches a time lock by instant, not PostgreSQL timezone formatting', () => {
    const lock = '2026-11-01T10:00:00.000Z';
    const postgres = '2026-11-01 19:00:00+09';
    const receipt = { ...saved, locked_until: lock };
    expect(
      verifyCasinoSelfLimit(
        { ...requested, lockedUntil: lock },
        receipt,
        { ...saved, locked_until: postgres },
      ),
    ).toEqual({ ...saved, locked_until: postgres });
    expect(() =>
      verifyCasinoSelfLimit(
        { ...requested, lockedUntil: lock },
        receipt,
        { ...saved, locked_until: '2026-11-01T10:00:01Z' },
      ),
    ).toThrow(/casino self-limit/);
  });

  it.each(['arcade', 'casino'])('requires %s action to read back persisted limits', (route) => {
    const source = readFileSync(resolve(process.cwd(), `src/app/${route}/actions.ts`), 'utf8');
    expect(source).toContain('verifyCasinoSelfLimit');
    expect(source).toContain("api<unknown>('/api/v1/casino/self-limit')");
  });
});
