/**
 * 프론트엔드 OSRS 스타일 2% 마켓 거래세 및 소각 분배 계산 모듈
 * 기준: docs/planning/deltas/v2026.09.23.406.ko.md Flaw G406-04
 */

export interface MarketTaxBreakdown {
  readonly grossWld: number;
  readonly taxRatePercent: number; // 2.0%
  readonly taxAmount: number;
  readonly sellerProceeds: number;
  readonly coinSinkAmount: number; // 50% 영구 소각
  readonly treasuryAllocation: number; // 50% 국고 적립
}

export const MARKET_TAX_RATE = 0.02; // 2%
export const MAX_MARKET_TAX_WLD = 500_000; // 50만 WLD 상한

export function calculateMarketTax(grossAmount: number | string): MarketTaxBreakdown {
  const num = typeof grossAmount === 'number' ? grossAmount : Number(grossAmount) || 0;
  const gross = Math.max(0, Math.floor(num));

  if (gross <= 0) {
    return {
      grossWld: 0,
      taxRatePercent: 2.0,
      taxAmount: 0,
      sellerProceeds: 0,
      coinSinkAmount: 0,
      treasuryAllocation: 0,
    };
  }

  const rawTax = Math.floor(gross * MARKET_TAX_RATE);
  const taxAmount = Math.min(MAX_MARKET_TAX_WLD, rawTax);
  const sellerProceeds = gross - taxAmount;

  const coinSinkAmount = Math.ceil(taxAmount / 2);
  const treasuryAllocation = taxAmount - coinSinkAmount;

  return {
    grossWld: gross,
    taxRatePercent: 2.0,
    taxAmount,
    sellerProceeds,
    coinSinkAmount,
    treasuryAllocation,
  };
}
