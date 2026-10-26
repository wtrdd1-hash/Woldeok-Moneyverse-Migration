import { describe, expect, it, vi } from 'vitest';
import { PublicTreasuryBondController } from './treasury-bond.controller';
import type { TreasuryBondService } from './treasury-bond.service';

describe('public virtual bond API provenance', () => {
  it('does not assert sovereign AAA or real-world principal guarantees', async () => {
    const service = { getOverview: vi.fn().mockResolvedValue({ totalBondsActive: 0 }),
      listBonds: vi.fn().mockResolvedValue([]) } as unknown as TreasuryBondService;
    const controller = new PublicTreasuryBondController(service);
    const response = await controller.getMarkets();
    expect(response.guarantor).toContain('게임 내 가상');
    expect(response.guarantor).not.toMatch(/AAA|100%|국가 보증/);
    expect(Number.isFinite(Date.parse(response.disclosed_at))).toBe(true);
  });
});
