import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { StatementDownloadLink } from './statement-link';

describe('recent owner wallet CSV action', () => {
  it('exposes an accessible same-origin download with a truthful 50-row limit', () => {
    const html = renderToStaticMarkup(<StatementDownloadLink />);
    expect(html).toContain('href="/app-api/v1/wallet/statement.csv"');
    expect(html).toContain('download="moneyverse-wallet-recent-50.csv"');
    expect(html).toContain('최근 최대 50건 CSV 다운로드');
    expect(html).not.toContain('전체 거래');
  });
});
