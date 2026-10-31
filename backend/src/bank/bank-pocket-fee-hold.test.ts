import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';
import { BankRepository, BankInputError, BankFeeContractUnavailableError } from './bank.repository';
import { PocketController } from './pocket.controller';

const key = '11111111-1111-4111-8111-111111111111';
const actor = '22222222-2222-4222-8222-222222222222';
const pocket = '33333333-3333-4333-8333-333333333333';
const request = { session: { user_id: actor } } as unknown as RequestWithSession;

/** P0 #2070: DEV SQL charges 100 WLD while UI advertises up to 400 WLD.
 * Until a DB-authoritative, atomic quote+charge contract exists, NO paid write
 * is permitted. This test does not claim the underlying SQL is repaired. */
describe('bank pocket fee-contract release hold', () => {
  it.each([
    ['sky', 'piggy-bank'],
    ['rose', 'heart'],
    ['sky', 'heart'],
  ])('rejects paid customization %s/%s before any SQL', async (theme, icon) => {
    const query = vi.fn().mockResolvedValue({ rows: [{ cost_wld: '100' }] });
    const repo = new BankRepository({ query } as unknown as Queryable);
    await expect(repo.customizePocket(key, actor, pocket, theme, icon))
      .rejects.toBeInstanceOf(BankFeeContractUnavailableError);
    expect(query).not.toHaveBeenCalled();
  });

  it('returns HTTP 503 to an authenticated controller caller without charging', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ cost_wld: '100' }] });
    const controller = new PocketController(new BankRepository({ query } as unknown as Queryable));
    await expect(controller.customizePocket(request, pocket, {
      idempotencyKey: key, themeColor: 'rose', iconCode: 'heart',
    })).rejects.toMatchObject({ status: 503 });
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects malformed keys before any SQL', async () => {
    const query = vi.fn();
    const repo = new BankRepository({ query } as unknown as Queryable);
    await expect(repo.customizePocket('not-a-uuid', actor, pocket, 'rose', 'heart'))
      .rejects.toBeInstanceOf(BankInputError);
    expect(query).not.toHaveBeenCalled();
  });
});
