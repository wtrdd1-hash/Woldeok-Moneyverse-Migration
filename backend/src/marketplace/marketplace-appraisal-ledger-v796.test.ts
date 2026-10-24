import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
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

  it('does not call the ledger function until DB-side ownership verification is available', async () => {
    const service = new MarketplaceService({ query: vi.fn() } as unknown as Queryable);
    await expect(service.requestAppraisal(actor, input)).rejects.toThrow(ServiceUnavailableException);
    expect(queryOne).not.toHaveBeenCalled();
  });

  it('refuses issuance even when the database pool is unavailable', async () => {
    const service = new MarketplaceService(null);
    await expect(service.requestAppraisal(actor, input)).rejects.toThrow(ServiceUnavailableException);
    expect(queryOne).not.toHaveBeenCalled();
  });
});
