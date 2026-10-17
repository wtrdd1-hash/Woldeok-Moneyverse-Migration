import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MarketplaceService } from './marketplace.service';
import { queryOne } from '../core/db';
import type { Queryable } from '../core/db';

vi.mock('../core/db', () => ({
  queryOne: vi.fn(),
  queryRows: vi.fn(),
}));

const actor = '11111111-1111-4111-8111-111111111111';
const input = { itemId: 'item_trophy_01', itemName: '골드 메달', rarity: 'EPIC' };

describe('v796 marketplace appraisal fail-closed ledger settlement', () => {
  beforeEach(() => vi.resetAllMocks());

  it('delegates fee and certificate issuance to exactly one owner-controlled database transaction', async () => {
    const cert = { certId: 'CERT-2026-ABC', appraisedValueWld: '4000', itemId: input.itemId };
    vi.mocked(queryOne).mockResolvedValue({ cert });
    const service = new MarketplaceService({ query: vi.fn() } as unknown as Queryable);
    const result = await service.requestAppraisal(actor, input);
    expect(result).toEqual(cert);
    expect(queryOne).toHaveBeenCalledTimes(1);
    const [pool, sql, params] = vi.mocked(queryOne).mock.calls[0]!;
    expect(pool).toBeTruthy();
    expect(sql).toContain('public.marketplace_create_appraisal_certificate(');
    expect(sql).not.toMatch(/(?:UPDATE\s+public\.account_balances|DO\s+\$\$)/i);
    expect(params).toEqual([actor, input.itemId, input.itemName, input.rarity]);
  });

  it('does not return a certificate if the ledger/fee settlement fails', async () => {
    vi.mocked(queryOne).mockRejectedValue(new Error('insufficient balance'));
    const service = new MarketplaceService({ query: vi.fn() } as unknown as Queryable);
    await expect(service.requestAppraisal(actor, input)).rejects.toThrow('insufficient balance');
    expect(queryOne).toHaveBeenCalledTimes(1);
  });
});
