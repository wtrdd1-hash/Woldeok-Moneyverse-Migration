import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { apiOrNull } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import AdminTreasuryPage, { dynamic, metadata } from './page';

vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: vi.fn() }));
vi.mock('../admin-back', () => ({ AdminBack: () => null }));
vi.mock('@/components/page-header', () => ({
  PageHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('./swf-control-panel', () => ({ SwfControlPanel: () => <div data-testid="verified-swf-panel" /> }));
vi.mock('./treasury-view', () => ({
  TreasuryView: ({ revenue, expenditure }: { revenue: unknown; expenditure: unknown }) => (
    <div
      data-testid="treasury-flow-props"
      data-revenue={revenue === null ? 'unavailable' : 'verified'}
      data-expenditure={expenditure === null ? 'unavailable' : 'verified'}
    />
  ),
}));

const overview = { vaults: [], total_treasury_wld: '0' };
const emptyLedger = { items: [], total_24h_wld: '0', total_7d_wld: '0', total_30d_wld: '0' };

describe('admin treasury evidence handoff', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(requireAdminConsole).mockResolvedValue(undefined as never);
  });

  it('forwards an unavailable expenditure response separately from verified zero revenue', async () => {
    const responses = new Map<string, unknown>([
      ['/api/v1/admin/treasury/overview', overview],
      ['/api/v1/admin/treasury/revenue', emptyLedger],
      ['/api/v1/admin/treasury/expenditure', null],
    ]);
    vi.mocked(apiOrNull).mockImplementation(async (path) => (responses.get(path) ?? null) as never);
    render(await AdminTreasuryPage());
    const state = screen.getByTestId('treasury-flow-props');
    expect(state.getAttribute('data-revenue')).toBe('verified');
    expect(state.getAttribute('data-expenditure')).toBe('unavailable');
    expect(requireAdminConsole).toHaveBeenCalledWith('/admin/treasury');
  });

  it('does not convert a failed revenue read to zero when expenditure is verified', async () => {
    const responses = new Map<string, unknown>([
      ['/api/v1/admin/treasury/overview', overview],
      ['/api/v1/admin/treasury/revenue', null],
      ['/api/v1/admin/treasury/expenditure', emptyLedger],
    ]);
    vi.mocked(apiOrNull).mockImplementation(async (path) => (responses.get(path) ?? null) as never);
    render(await AdminTreasuryPage());
    const state = screen.getByTestId('treasury-flow-props');
    expect(state.getAttribute('data-revenue')).toBe('unavailable');
    expect(state.getAttribute('data-expenditure')).toBe('verified');
  });

  it('preserves independently verified SWF evidence when the overview is unavailable', async () => {
    const swf = {
      config: {
        id: 'current', is_enabled: false, safe_reserve_wld: '25000000',
        max_single_investment_wld: '10000', reinvestment_ratio_pct: 0,
        max_investment_ratio_pct: 0, equity_ratio_pct: 0,
        bond_ratio_pct: 0, dividend_ratio_pct: 0,
      },
      portfolios: [], events: [],
    };
    vi.mocked(apiOrNull).mockImplementation(async (path) =>
      (path === '/api/v1/admin/treasury/swf' ? swf : null) as never);
    render(await AdminTreasuryPage());
    expect(screen.getByText('국고 현황을 불러오지 못했습니다.')).toBeTruthy();
    expect(screen.getByTestId('verified-swf-panel')).toBeTruthy();
    expect(screen.queryByTestId('treasury-flow-props')).toBeNull();
  });

  it('keeps the private administrator page dynamic and non-indexable', () => {
    expect(dynamic).toBe('force-dynamic');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
