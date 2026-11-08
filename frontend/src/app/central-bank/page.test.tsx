import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const { publicApiMock } = vi.hoisted(() => ({ publicApiMock: vi.fn() }));
vi.mock('@/lib/api', () => ({ publicApi: publicApiMock }));
vi.mock('@/lib/seo', () => ({ canonicalUrl: (p: string) => `https://easy-scraping.com${p}` }));

import PublicCentralBankPage, { metadata } from './page';

describe('PublicCentralBankPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders base rate, reserve requirement, and macro aggregates when publicApi returns data', async () => {
    publicApiMock.mockImplementation(async (path: string) => {
      if (path.includes('monetary-aggregates')) {
        return {
          aggregates: { m0_wld: '196134971', m1_wld: '200000000', m2_wld: '300000000' },
          components: {
            treasury_reserve_wld: '191055911',
            circulating_cash_wld: '4784052',
            bank_reserves_wld: '57708',
            bank_deposits_wld: '10000000',
            bonds_and_time_deposits_wld: '50000000',
          },
          multipliers: { money_multiplier: 1.53, reserve_coverage_ratio: 100 },
          timestamp: '2026-11-08T12:00:00Z',
        };
      }
      if (path.includes('base-rate')) {
        return {
          base_rate_pct: 3.5,
          target_inflation_pct: 2.0,
          rationale: '물가안정 및 금융안정 도모',
          enforced_at: '2026-11-08T00:00:00Z',
        };
      }
      if (path.includes('reserve-requirement')) {
        return {
          reserve_requirement_pct: 7.0,
          rationale: '지급준비율 유지',
          enforced_at: '2026-11-08T00:00:00Z',
        };
      }
      if (path.includes('commercial-rates')) {
        return {
          base_rate_pct: 3.5,
          deposit_rate_pct: 3.2,
          loan_rate_base_pct: 5.2,
          spread_pct: 2.0,
          effective_date: '2026-11-08',
        };
      }
      return null;
    });

    const html = renderToStaticMarkup(await PublicCentralBankPage());
    expect(html).toContain('한국은행 금융통화위원회 통화정책 공시');
    expect(html).toContain('3.50%');
    expect(html).toContain('7.00%');
    expect(html).toContain('196,134,971 WLD');
    expect(html).toContain('물가안정 및 금융안정 도모');
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });

  it('renders gracefully with fallback defaults when publicApi returns null', async () => {
    publicApiMock.mockResolvedValue(null);

    const html = renderToStaticMarkup(await PublicCentralBankPage());
    expect(html).toContain('한국은행 금융통화위원회 통화정책 공시');
    expect(html).toContain('3.50%');
    expect(html).toContain('7.00%');
    expect(html).toContain('0 WLD');
  });
});
