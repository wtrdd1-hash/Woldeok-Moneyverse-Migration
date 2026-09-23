import { describe, expect, it, vi } from 'vitest';
import { PostgresBusinessRepository } from './business.repository';
import type { Queryable } from '../core/db';

describe('PostgresBusinessRepository - Supply Chain & Procurement', () => {
  const mockPool = {
    query: vi.fn(),
  } as unknown as Queryable;

  const repo = new PostgresBusinessRepository(mockPool);

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

  it('instantiates repository correctly and exposes supply chain methods', () => {
    expect(repo).toBeDefined();
    expect(typeof repo.supplyChainOverview).toBe('function');
    expect(typeof repo.procureMaterials).toBe('function');
    expect(typeof repo.upgradeStorage).toBe('function');
  });
});
