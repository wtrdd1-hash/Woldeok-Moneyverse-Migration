import { describe, expect, it } from 'vitest';
import { bondHoldingsCsv } from './bond-holdings-csv';

const BOND = {
  id: '22222222-2222-4222-8222-222222222222', bond_code: 'BOND_30D',
  bond_name: '=HYPERLINK("https://bad.example")', principal_amount: '999999999999999999999999999999',
  maturity_amount: '1000000000000000000000000000000', yield_bps: 100,
  purchased_at: '2026-10-01T00:00:00Z', maturity_at: '2026-10-31T00:00:00Z',
  is_matured: false, status: 'holding',
};

describe('private bond holdings CSV', () => {
  it('preserves 30-digit WLD values, escapes formulas and includes only current holdings', () => {
    const csv = bondHoldingsCsv({ bonds: [BOND], scope: 'current_holdings_only' });
    expect(csv).toContain('999999999999999999999999999999');
    expect(csv).toContain('1000000000000000000000000000000');
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain('Current holdings only');
    expect(csv).not.toContain('NaN');
  });

  it('exports header-only CSV for a verified empty portfolio', () => {
    expect(bondHoldingsCsv({ bonds: [], scope: 'current_holdings_only' })).toContain('Bond ID');
  });

  it('fails closed on absent, forged or truncated results', () => {
    for (const data of [null, { bonds: [], scope: 'all_history' }, { bonds: [{ ...BOND, principal_amount: 100 }] }, { bonds: Array.from({ length: 101 }, () => BOND), scope: 'current_holdings_only' }]) {
      expect(() => bondHoldingsCsv(data)).toThrow();
    }
  });
});
