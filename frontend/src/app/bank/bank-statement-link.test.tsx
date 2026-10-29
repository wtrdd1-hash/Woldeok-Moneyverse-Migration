import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BankStatementDownloadLink } from './bank-statement-link';

describe('member bank statement download affordance', () => {
  it('uses a native downloadable anchor rather than Next client-side navigation', () => {
    const html = renderToStaticMarkup(<BankStatementDownloadLink locale="ko" />);
    expect(html).toContain('href="/bank/statement.csv"');
    expect(html).toContain('download="moneyverse-bank-statement.csv"');
    expect(html).toContain('focus-visible:underline');
    expect(html).toContain('내 은행 잔액 CSV 저장');
  });
  it('offers a readable English label', () => {
    expect(renderToStaticMarkup(<BankStatementDownloadLink locale="en" />)).toContain('Download my bank snapshot');
  });
});
