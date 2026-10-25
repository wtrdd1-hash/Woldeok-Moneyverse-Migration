import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PublicEnterprisesPage from './page';
import { publicApi } from '@/lib/api';

vi.mock('@/lib/api', () => ({ publicApi: vi.fn() }));

const snapshot = {
  source: 'DATABASE_SNAPSHOT',
  settlementStatus: 'NOT_VERIFIED',
  disclosed_at: '2026-10-25T00:00:00.000Z',
  overview: {
    holding_name: 'Verified holding', holding_code: 'WSHC',
    total_soe_assets_wld: '9007199254740993', hourly_soe_revenue_wld: '100',
    hourly_soe_profit_wld: '60', hourly_soe_dividends_wld: '18',
    governance_model: 'Virtual model',
  },
  soes: [{
    code: 'SOE_TEST', name: 'Verified SOE', category: 'ENERGY',
    ceo_name: 'Test executive', total_assets_wld: '9007199254740993',
    net_profit_hourly_wld: '60', dividend_rate_bps: 3000,
    eval_grade: 'A', description: 'Actual stored row',
  }],
};

describe('public enterprise disclosure source truth', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('never invents enterprise balances or records when the API is unavailable', async () => {
    vi.mocked(publicApi).mockResolvedValue(null);
    render(await PublicEnterprisesPage());
    expect(screen.getByText(/공시 정보를 불러올 수 없습니다/)).toBeDefined();
    expect(screen.queryByText(/365,000,000/)).toBeNull();
    expect(screen.queryByText(/월덱 에너지공사/)).toBeNull();
    expect(screen.queryByText(/실시간 공시/)).toBeNull();
  });

  it('shows only verified database rows with exact integer strings and labels projections', async () => {
    vi.mocked(publicApi).mockResolvedValue(snapshot);
    render(await PublicEnterprisesPage());
    expect(screen.getByText('Verified SOE')).toBeDefined();
    expect(screen.getAllByText(/9,007,199,254,740,993 WLD/).length).toBeGreaterThan(0);
    expect(screen.getByText(/예상 국고 배당/)).toBeDefined();
    expect(screen.getByText(/실제 국고 납입이 확인된 금액이 아닙니다/)).toBeDefined();
    expect(screen.queryByText(/365,000,000/)).toBeNull();
  });

  it('refuses unverified source metadata and malformed money instead of displaying it', async () => {
    vi.mocked(publicApi).mockResolvedValue({ ...snapshot, source: 'UNKNOWN', overview: { ...snapshot.overview, total_soe_assets_wld: 9007199254740994 } });
    render(await PublicEnterprisesPage());
    expect(screen.getByText(/공시 정보를 불러올 수 없습니다/)).toBeDefined();
    expect(screen.queryByText('Verified SOE')).toBeNull();
  });
});
