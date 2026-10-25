import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { BankRepository } from './bank.repository';
import { BankController } from './bank.controller';
import type { RequestWithSession } from '../auth/session.context';
import type { Queryable } from '../core/db';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const BOND = {
  id: '22222222-2222-4222-8222-222222222222', bond_code: 'BOND_30D',
  bond_name: '30-day virtual bond', principal_amount: '999999999999999999999999999999',
  maturity_amount: '1000000000000000000000000000000', yield_bps: 100,
  purchased_at: '2026-10-01T00:00:00Z', maturity_at: '2026-10-31T00:00:00Z',
  is_matured: false, status: 'holding',
};
function repository(standing: unknown) {
  const query = vi.fn().mockResolvedValue({ rows: [{ standing }] });
  return { repo: new BankRepository({ query } as unknown as Queryable), query };
}

describe('owner-only current bond holdings projection', () => {
  it('takes the actor from the authenticated session, not a request-supplied user id', async () => {
    const listBondHoldings = vi.fn().mockResolvedValue({ bonds: [], scope: 'current_holdings_only' });
    const controller = new BankController({ listBondHoldings } as unknown as BankRepository);
    const request = { session: { user_id: ACTOR } } as unknown as RequestWithSession;
    await expect(controller.bondHoldings(request)).resolves.toEqual({ bonds: [], scope: 'current_holdings_only' });
    expect(listBondHoldings).toHaveBeenCalledWith(ACTOR);
  });

  it('returns HTTP 503 when verified holdings cannot be read, not a false empty portfolio', async () => {
    const controller = new BankController({
      listBondHoldings: vi.fn().mockRejectedValue(new Error('database unavailable')),
    } as unknown as BankRepository);
    const request = { session: { user_id: ACTOR } } as unknown as RequestWithSession;
    await expect(controller.bondHoldings(request)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('uses the owner-scoped SECURITY DEFINER standing function and retains exact integer strings', async () => {
    const { repo, query } = repository({ bonds: [BOND] });
    const result = await repo.listBondHoldings(ACTOR);
    expect(result).toEqual({ bonds: [BOND], scope: 'current_holdings_only' });
    expect(query).toHaveBeenCalledWith(expect.stringContaining('public.bank_get_my_standing($1)'), [ACTOR]);
  });

  it('rejects missing data instead of inventing an empty portfolio', async () => {
    const { repo } = repository(null);
    await expect(repo.listBondHoldings(ACTOR)).rejects.toThrow();
  });

  it('rejects a malformed amount or non-holding row instead of issuing a misleading statement', async () => {
    for (const bond of [{ ...BOND, principal_amount: '1e30' }, { ...BOND, status: 'redeemed' }]) {
      const { repo } = repository({ bonds: [bond] });
      await expect(repo.listBondHoldings(ACTOR)).rejects.toThrow();
    }
  });

  it('refuses an unbounded result rather than silently truncating holdings', async () => {
    const { repo } = repository({ bonds: Array.from({ length: 101 }, () => BOND) });
    await expect(repo.listBondHoldings(ACTOR)).rejects.toThrow();
  });
});
