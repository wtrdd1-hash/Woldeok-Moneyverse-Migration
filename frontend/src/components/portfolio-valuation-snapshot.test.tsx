import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PortfolioValuationSnapshot } from './portfolio-valuation-snapshot';

const snapshot = {
  asOfLabel: '2026-10-25 11:50 KST',
  marketValueWld: '120,000',
  unrealizedGainWld: '+15,000',
  unrealizedReturnPct: '+12.5%',
  largestHoldingSymbol: 'DUCKS',
  largestHoldingReturnPct: '+24.0%',
  holdingCount: 5,
};

describe('PortfolioValuationSnapshot', () => {
  it('reports only current server-backed holdings valuation, not invented weekly financial transactions', () => {
    render(<PortfolioValuationSnapshot data={snapshot} />);
    expect(screen.getByText(/보유 평가 스냅샷|Holdings Valuation Snapshot/)).toBeDefined();
    expect(screen.getByText(/120,000\s*WLD/)).toBeDefined();
    expect(screen.getByText(/\+15,000\s*WLD/)).toBeDefined();
    expect(screen.getByText('DUCKS (+24.0%)')).toBeDefined();
    expect(screen.getByText(/2026-10-25 11:50 KST/)).toBeDefined();
    expect(screen.queryByText(/주간 실현|Weekly Realized|총 거래대금|Total Turnover|체결 횟수|Executed Trades|Burned Fees|A등급|주차/)).toBeNull();
    expect(screen.getByText(/체결·세금·소각 영수증이 아닙니다|not a trade, tax, or burn receipt/)).toBeDefined();
  });

  it('provides keyboard-accessible copy and PNG actions with at least 44px targets', () => {
    render(<PortfolioValuationSnapshot data={snapshot} />);
    const copy = screen.getByRole('button', { name: /요약 복사|Copy summary/ });
    const download = screen.getByRole('button', { name: /PNG 저장|Save PNG/ });
    expect(copy.className).toContain('min-h-11');
    expect(download.className).toContain('min-h-11');
  });
});
