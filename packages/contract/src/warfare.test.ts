import { describe, it, expect } from 'vitest';
import {
  calculateSiegeDamage,
  calculateGuildTaxDividend,
  calculateShieldRepairCost,
  INITIAL_TERRITORIES,
} from './warfare';

describe('Discord Guild Warfare Contract Logic', () => {
  it('has 5 initial territory zones', () => {
    expect(INITIAL_TERRITORIES.length).toBe(5);
    const gangnam = INITIAL_TERRITORIES.find((t) => t.id === 'GANGNAM_TOWER');
    expect(gangnam).toBeDefined();
    expect(gangnam?.dailyTaxYieldWld).toBe(500000);
  });

  it('calculates siege damage correctly with defense and shield reduction', () => {
    const res = calculateSiegeDamage(10000, 5000, 3);
    expect(res.damage).toBeGreaterThan(0);
    expect(typeof res.isCritical).toBe('boolean');
  });

  it('calculates guild tax dividend based on member contribution ratio', () => {
    const dividend = calculateGuildTaxDividend(500000, 200, 1000);
    expect(dividend).toBe(100000); // 20% of 500,000

    const zeroDividend = calculateGuildTaxDividend(500000, 0, 1000);
    expect(zeroDividend).toBe(0);
  });

  it('calculates shield repair cost correctly', () => {
    const cost = calculateShieldRepairCost(150000, 200000, 3);
    expect(cost).toBeGreaterThan(0);

    const zeroCost = calculateShieldRepairCost(200000, 200000, 3);
    expect(zeroCost).toBe(0);
  });
});
