import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RecentLedgerInsights } from './recent-insights';

describe('wallet activity insight display', () => {
  it('labels totals as a capped recent sample, never all-time earnings', () => {
    const html = renderToStaticMarkup(<RecentLedgerInsights insights={{
      scope: 'recent', requestedLimit: 50, sampledCount: 50,
      incomingAmount: '90071992547409931234567890123456789012',
      outgoingAmount: '25', netAmount: '90071992547409931234567890123456788987', neutralCount: 1,
    }} />);
    expect(html).toContain('최근 최대 50건');
    expect(html).toContain('입금 합계');
    expect(html).toContain('출금 합계');
    expect(html).toContain('내부 이동');
    expect(html).toContain('전체 기간 합계가 아닙니다.');
    expect(html).toContain('90,071,992,547,409,931,234,567,890,123,456,789,012');
  });
});
