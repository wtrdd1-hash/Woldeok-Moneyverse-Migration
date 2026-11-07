/** A user-generated share preview, not a certified ledger receipt. */
export interface PortfolioShareSnapshot {
  readonly assetText: string;
  readonly profitText: string;
  readonly yieldText: string;
  readonly grade: 'S+' | 'A' | 'B' | 'C';
  readonly isProfit: boolean;
}

function exactInteger(value: string): bigint {
  if (typeof value !== 'string' || !/^-?(0|[1-9]\d*)$/.test(value)) {
    throw new Error('Portfolio snapshot requires an exact integer string');
  }
  return BigInt(value);
}

function grouped(value: bigint): string {
  return value.toLocaleString('ko-KR');
}

export function formatPortfolioShareSnapshot(
  totalAssetValue: string,
  totalProfitAmount: string,
  profitRateBps: string,
): PortfolioShareSnapshot {
  const assets = exactInteger(totalAssetValue);
  const profit = exactInteger(totalProfitAmount);
  const bps = exactInteger(profitRateBps);
  if (assets < 0n) throw new Error('Portfolio assets must not be negative');

  const absBps = bps < 0n ? -bps : bps;
  const yieldText = (bps > 0n ? '+' : bps < 0n ? '-' : '')
    + (absBps / 100n).toString()
    + '.'
    + (absBps % 100n).toString().padStart(2, '0')
    + '%';

  return {
    assetText: grouped(assets) + ' WLD',
    profitText: (profit > 0n ? '+' : '') + grouped(profit) + ' WLD',
    yieldText,
    grade: bps >= 2000n ? 'S+' : bps >= 1000n ? 'A' : bps >= 0n ? 'B' : 'C',
    isProfit: profit > 0n,
  };
}
