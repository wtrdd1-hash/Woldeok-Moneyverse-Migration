import { describe, expect, it } from 'vitest';
import {
  calculateListingFee,
  calculateSaleFee,
  calculateSellerNet,
  P0_CRAFTING_RECIPES,
} from './crafting-recipes';

describe('Marketplace P0 Fees & Crafting Recipes', () => {
  describe('calculateListingFee', () => {
    it('applies 25 WLD minimum fee for zero or small prices', () => {
      expect(calculateListingFee(0)).toBe('25');
      expect(calculateListingFee('100')).toBe('25');
      expect(calculateListingFee('24000')).toBe('25');
    });

    it('calculates 0.1% ceiling fee above minimum threshold', () => {
      // 50,000 * 0.001 = 50
      expect(calculateListingFee(50_000)).toBe('50');
      // 100,500 * 0.001 = 100.5 -> ceil = 101
      expect(calculateListingFee('100500')).toBe('101');
    });
  });

  describe('calculateSaleFee & calculateSellerNet', () => {
    it('calculates 1% ceiling sale fee correctly', () => {
      expect(calculateSaleFee(0)).toBe('0');
      expect(calculateSaleFee(100)).toBe('1');
      expect(calculateSaleFee(1250)).toBe('13'); // 12.5 -> 13
      expect(calculateSaleFee('10000')).toBe('100');
    });

    it('calculates net payout for seller', () => {
      expect(calculateSellerNet(100)).toBe('99');
      expect(calculateSellerNet(1250)).toBe('1237'); // 1250 - 13 = 1237
      expect(calculateSellerNet('10000')).toBe('9900');
    });
  });

  describe('P0_CRAFTING_RECIPES', () => {
    it('provides exactly 4 core P0 crafting recipes', () => {
      expect(P0_CRAFTING_RECIPES).toHaveLength(4);
      const kinds = P0_CRAFTING_RECIPES.map((r) => r.kind);
      expect(kinds).toContain('tinting');
      expect(kinds).toContain('restoration');
      expect(kinds).toContain('engraving');
      expect(kinds).toContain('boost');
    });

    it('ensures each recipe has valid materials and result definition', () => {
      for (const recipe of P0_CRAFTING_RECIPES) {
        expect(recipe.materials.length).toBeGreaterThan(0);
        expect(BigInt(recipe.feeWld)).toBeGreaterThan(0n);
        expect(recipe.resultItem.name).toBeTruthy();
        expect(recipe.resultItem.code).toBeTruthy();
      }
    });
  });
});
