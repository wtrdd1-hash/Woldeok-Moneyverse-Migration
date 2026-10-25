import { groupDigits } from '@/lib/money';
import type { PortfolioValuationSnapshotData } from '@/components/portfolio-valuation-snapshot';
import type { PortfolioAnalysis } from './analysis';

export function signedPercent(bpsText: string): string {
  const bps = Number(bpsText);
  if (!Number.isSafeInteger(bps)) return '—';
  const prefix = bps > 0 ? '+' : bps < 0 ? '−' : '';
  return `${prefix}${(Math.abs(bps) / 100).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}%`;
}

/** An authenticated holdings read proves valuation, not executed trades, taxes, or fees. */
export function portfolioValuationData(analysis: PortfolioAnalysis, asOfLabel: string): PortfolioValuationSnapshotData {
  const largest = analysis.holdings[0]; // sorted by market value, not return percentage
  return {
    asOfLabel,
    marketValueWld: groupDigits(analysis.total_market_value),
    unrealizedGainWld: `${analysis.total_unrealized_gain_loss.startsWith('-') ? '' : '+'}${groupDigits(analysis.total_unrealized_gain_loss)}`,
    unrealizedReturnPct: signedPercent(analysis.total_gain_loss_bps),
    largestHoldingSymbol: largest?.symbol ?? '—',
    largestHoldingReturnPct: signedPercent(largest?.gain_loss_bps ?? '0'),
    holdingCount: analysis.holdings.length,
  };
}
