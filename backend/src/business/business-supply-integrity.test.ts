import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { BusinessController } from './business.controller';
import { PostgresBusinessRepository } from './business.repository';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const OWNERSHIP = '22222222-2222-4222-8222-222222222222';

describe('business supply chain fails closed until ledger-backed procurement exists', () => {
  it('only exposes owner-verified identity, not invented warehouse inventory or demand', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ ownership_id: OWNERSHIP, symbol: 'CVS' }] });
    const repository = new PostgresBusinessRepository({ query } as any);
    const result = await repository.supplyChainOverview(ACTOR, OWNERSHIP);
    expect(result).toEqual({ ownershipId: OWNERSHIP, businessSymbol: 'CVS', available: false });
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0]?.[0]).toContain('business_my_ownerships($1)');
  });

  it('never writes an outbox event or invents a transaction ID for procurement', async () => {
    const query = vi.fn();
    const repository = new PostgresBusinessRepository({ query } as any);
    await expect(repository.procureMaterials({ userId: ACTOR, ownershipId: OWNERSHIP, materialCode: 'RAW_PACKAGED', quantity: 10, idempotencyKey: '33333333-3333-4333-8333-333333333333' })).rejects.toThrow();
    expect(query).not.toHaveBeenCalled();
  });

  it('never writes an outbox event for an unimplemented storage upgrade', async () => {
    const query = vi.fn();
    const repository = new PostgresBusinessRepository({ query } as any);
    await expect(repository.upgradeStorage({ userId: ACTOR, ownershipId: OWNERSHIP, idempotencyKey: '33333333-3333-4333-8333-333333333333' })).rejects.toThrow();
    expect(query).not.toHaveBeenCalled();
  });

  it('returns HTTP 503 at both money-mutating controller boundaries', () => {
    const controller = new BusinessController({} as any);
    const request = { session: { user_id: ACTOR } } as any;
    expect(() => controller.procureMaterials(request, OWNERSHIP, { materialCode: 'RAW_PACKAGED', quantity: 10, idempotencyKey: '33333333-3333-4333-8333-333333333333' })).toThrow(ServiceUnavailableException);
    expect(() => controller.upgradeStorage(request, OWNERSHIP, { idempotencyKey: '33333333-3333-4333-8333-333333333333' })).toThrow(ServiceUnavailableException);
  });
});
