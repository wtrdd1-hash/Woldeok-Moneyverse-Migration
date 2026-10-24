import { describe, expect, it, vi } from 'vitest';
import { HttpStatus } from '@nestjs/common';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceController } from './marketplace.controller';

const actor = '11111111-1111-4111-8111-111111111111';
const forgedItem = { itemId: 'unowned_item', itemName: 'Invented trophy', rarity: 'LEGENDARY' };

function expectHeld(error: unknown): boolean {
  expect(error).toMatchObject({ status: HttpStatus.SERVICE_UNAVAILABLE });
  return true;
}

describe('P0 appraisal ownership containment', () => {
  it('refuses an unverified appraisal without issuing a database certificate or charging a fee', async () => {
    const query = vi.fn();
    const service = new MarketplaceService({ query } as unknown as Queryable);
    await expect(service.requestAppraisal(actor, forgedItem)).rejects.toSatisfy(expectHeld);
    expect(query).not.toHaveBeenCalled();
  });

  it('refuses even a plausible item until PostgreSQL verifies ownership and canonical metadata', async () => {
    const query = vi.fn();
    const service = new MarketplaceService({ query } as unknown as Queryable);
    await expect(service.requestAppraisal(actor, { itemId: 'real_item', itemName: 'Real', rarity: 'EPIC' })).rejects.toSatisfy(expectHeld);
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects the authenticated HTTP write route before invoking a mocked service', () => {
    const service = { requestAppraisal: vi.fn().mockResolvedValue({ certId: 'FORGED' }) } as unknown as MarketplaceService;
    const controller = new MarketplaceController(service);
    const request = { session: { user_id: actor } } as unknown as RequestWithSession;
    expect(() => controller.requestAppraisal(request, forgedItem)).toThrow(expect.objectContaining({ status: HttpStatus.SERVICE_UNAVAILABLE }));
    expect(service.requestAppraisal).not.toHaveBeenCalled();
  });
});
