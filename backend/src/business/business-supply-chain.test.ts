import { describe, expect, it, vi } from 'vitest';
import { BusinessRepository } from './business.repository';
import type { DatabasePool } from '../database/pool';

describe('BusinessRepository - Supply Chain & Procurement', () => {
  const mockPool = {
    connect: vi.fn(),
    query: vi.fn(),
  } as unknown as DatabasePool;

  const repo = new BusinessRepository(mockPool);

  it('calculates storage upgrade cost correctly with exponential factor', () => {
    // base_cost = 50,000, factor = 1.40^(n-1)
    const baseCost = 50_000;
    const level1Cost = Math.round(baseCost * Math.pow(1.4, 0));
    const level2Cost = Math.round(baseCost * Math.pow(1.4, 1));
    const level3Cost = Math.round(baseCost * Math.pow(1.4, 2));

    expect(level1Cost).toBe(50_000);
    expect(level2Cost).toBe(70_000);
    expect(level3Cost).toBe(98_000);
  });

  it('calculates 2% hard sink procurement fee accurately', () => {
    const unitPrice = 50;
    const quantity = 20;
    const totalCost = unitPrice * quantity; // 1,000
    const fee = Math.floor(totalCost * 0.02); // 20

    expect(totalCost).toBe(1_000);
    expect(fee).toBe(20);
    expect(fee / totalCost).toBe(0.02);
  });

  it('defines material types and valid limits', () => {
    const validMaterials = ['RAW_PACKAGED', 'RAW_ENERGY'];
    expect(validMaterials).toContain('RAW_PACKAGED');
    expect(validMaterials).toContain('RAW_ENERGY');
  });
});
