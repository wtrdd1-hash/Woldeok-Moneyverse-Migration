/**
 * OSRS 스타일 2% 마켓 거래세 및 자동 소각/국고 분배 엔진 (Automated Item & Coin Sink)
 * 기준: docs/planning/deltas/v2026.09.23.406.ko.md Flaw G406-04
 *
 * 규칙:
 * 1. 거래 체결 시 체결 총액의 2% 거래세 원천 징수
 * 2. 1회 거래당 최대 거래세 상한 500,000 WLD
 * 3. 징수된 거래세의 50%는 즉시 영구 소각(Coin Sink)
 * 4. 나머지 50%는 국고(Treasury)에 적립되어 최저가 잉여 아이템 자동 매수 파괴(Item Sink)에 할당
 */

export interface MarketTaxBreakdown {
  readonly grossWld: bigint;
  readonly taxRatePercent: number; // 2.0%
  readonly taxAmount: bigint;
  readonly sellerProceeds: bigint;
  readonly coinSinkAmount: bigint; // 50% 즉시 영구 소각
  readonly treasuryAllocation: bigint; // 50% 국고 자동 아이템 매입 풀
}

export const MARKET_TAX_RATE = 0.02; // 2%
export const MAX_MARKET_TAX_WLD = 500_000n; // 50만 WLD 상한

export function calculateMarketTax(grossAmount: bigint | number | string): MarketTaxBreakdown {
  const gross = typeof grossAmount === 'bigint' 
    ? grossAmount 
    : BigInt(Math.max(0, Math.floor(Number(grossAmount))));

  if (gross <= 0n) {
    return {
      grossWld: 0n,
      taxRatePercent: 2.0,
      taxAmount: 0n,
      sellerProceeds: 0n,
      coinSinkAmount: 0n,
      treasuryAllocation: 0n,
    };
  }

  // 2% 계산 (정수 산술: gross * 2 / 100)
  const rawTax = (gross * 2n) / 100n;
  const taxAmount = rawTax > MAX_MARKET_TAX_WLD ? MAX_MARKET_TAX_WLD : rawTax;

  const sellerProceeds = gross - taxAmount;

  // 50% 영구 소각, 50% 국고 적립 (홀수일 경우 소각 쪽에 1 올림)
  const coinSinkAmount = (taxAmount + 1n) / 2n;
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
