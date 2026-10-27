import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { EnterpriseControlTower } from './enterprise-control-tower';

describe('SOE remittance safety hold in admin UI', () => {
  it('disables manual WLD harvest and explains that ledger settlement is unavailable', () => {
    const html = renderToStaticMarkup(createElement(EnterpriseControlTower, {
      initialOverview: {
        holding_name: 'Test', holding_code: 'WSHC', total_soe_assets_wld: '0',
        hourly_soe_revenue_wld: '0', hourly_soe_profit_wld: '0', hourly_soe_dividends_wld: '0',
        total_private_enterprises: 0, total_private_valuation_wld: '0', hourly_corporate_tax_wld: '0',
        governance_model: 'Test',
      },
      initialSoes: [], initialPrivate: [], initialDividendLogs: [],
    }));
    expect(html).toMatch(/<button[^>]*\sdisabled=""[^>]*>/);
    expect(html).toContain('원장 정산 검증 전까지 배당 수취가 중지되었습니다');
    expect(html).toContain('시간당 예상 배당 (실제 납입 아님)');
    expect(html).toContain('기존 공기업 배당 기록 (원장 대사 미검증)');
  });
});
