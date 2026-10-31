import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }) }));
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { EnterpriseControlTower } from './enterprise-control-tower';

describe('SOE remittance safety hold in admin UI', () => {
  it('disables manual WLD harvest and explains that ledger settlement is unavailable', () => {
    const html = renderToStaticMarkup(
      createElement(EnterpriseControlTower, {
        initialOverview: {
          holding_name: 'Test',
          holding_code: 'WSHC',
          total_soe_assets_wld: '0',
          hourly_soe_revenue_wld: '0',
          hourly_soe_profit_wld: '0',
          hourly_soe_dividends_wld: '0',
          total_private_enterprises: 0,
          total_private_valuation_wld: '0',
          hourly_corporate_tax_wld: '0',
          governance_model: 'Test',
        },
        initialSoes: [],
        initialPrivate: [],
        initialDividendLogs: [],
      }),
    );
    expect(html).toMatch(/<button[^>]*\sdisabled=""[^>]*>/);
    expect(html).toContain('원장 정산 검증 전까지 배당 수취가 중지되었습니다');
    expect(html).toContain('시간당 예상 배당 (실제 납입 아님)');
    expect(html).toContain('기존 공기업 배당 기록 (원장 대사 미검증)');
  });
});

describe('verified SOE operating status', () => {
  it('counts only ACTIVE enterprises and disables unverified mutations on mobile and desktop', () => {
    const html = renderToStaticMarkup(
      createElement(EnterpriseControlTower, {
        initialOverview: {
          holding_name: 'WSHC',
          holding_code: 'WSHC',
          total_soe_assets_wld: '10',
          hourly_soe_revenue_wld: '10',
          hourly_soe_profit_wld: '10',
          hourly_soe_dividends_wld: '3',
          total_private_enterprises: 0,
          total_private_valuation_wld: '0',
          hourly_corporate_tax_wld: '0',
          governance_model: 'Model',
        },
        initialSoes: [
          {
            id: '11111111-1111-4111-8111-111111111111',
            code: 'SOE_POWER',
            name: 'Power',
            category: 'ENERGY',
            ceo_name: 'CEO',
            total_assets_wld: '10',
            operating_revenue_hourly_wld: '10',
            operating_cost_hourly_wld: '0',
            net_profit_hourly_wld: '10',
            dividend_rate_bps: 3000,
            eval_grade: 'A',
            eval_score: 80,
            status: 'PAUSED',
            description: 'Power',
          },
        ],
        initialPrivate: [],
        initialDividendLogs: [],
      }),
    );
    expect(html).toContain('0개 가동 중 / 전체 1개');
    expect(html).toContain('상태 변경은 검증 전까지 중지');
    expect(html).toMatch(/disabled=""[^>]*aria-describedby="soe-status-mutation-hold"/);
  });
});
