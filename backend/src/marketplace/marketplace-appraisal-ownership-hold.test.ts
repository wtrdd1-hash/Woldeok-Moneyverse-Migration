import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import type { MarketplaceService } from './marketplace.service';
import type { RequestWithSession } from '../auth/session.context';

describe('marketplace appraisal issuance ownership fence', () => {
  it('rejects a forged catalog item before any ledger-backed certificate function is invoked', () => {
    const requestAppraisal = vi.fn();
    const controller = new MarketplaceController({ requestAppraisal } as unknown as MarketplaceService);
    const request = { session: { user_id: '11111111-1111-4111-8111-111111111111' } } as unknown as RequestWithSession;
    let thrown: unknown;
    try { controller.requestAppraisal(request, {
      itemId: 'not-owned',
      itemName: 'Fabricated artifact',
      rarity: 'LEGENDARY',
    }); } catch (error) { thrown = error; }
    expect(thrown).toBeInstanceOf(ServiceUnavailableException);
    expect((thrown as ServiceUnavailableException).getStatus()).toBe(503);
    expect(requestAppraisal).not.toHaveBeenCalled();
  });
});
