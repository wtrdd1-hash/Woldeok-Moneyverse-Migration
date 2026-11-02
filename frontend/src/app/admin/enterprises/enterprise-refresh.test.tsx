// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const mocks = vi.hoisted(() => ({ refresh: vi.fn(), success: vi.fn(), error: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock('sonner', () => ({ toast: { success: mocks.success, error: mocks.error } }));
import { EnterpriseControlTower } from './enterprise-control-tower';

const props = {
  initialOverview: {
    holding_name: 'WSHC', holding_code: 'WSHC', total_soe_assets_wld: '0',
    hourly_soe_revenue_wld: '0', hourly_soe_profit_wld: '0', hourly_soe_dividends_wld: '0',
    total_private_enterprises: 0, total_private_valuation_wld: '0',
    hourly_corporate_tax_wld: '0', governance_model: 'Verified',
  },
  initialSoes: [], initialPrivate: [], initialDividendLogs: [],
};

beforeEach(() => { vi.resetAllMocks(); });

describe('SOE administrator refresh truth', () => {
  it('does not report synchronization or refresh the view after a failed backend readback', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    render(<EnterpriseControlTower {...props} />);
    fireEvent.click(screen.getByRole('button', { name: '새로고침' }));
    await waitFor(() => expect(mocks.error).toHaveBeenCalled());
    expect(mocks.success).not.toHaveBeenCalled();
    expect(mocks.refresh).not.toHaveBeenCalled();
  });

  it('requires explicit VERIFIED source before acknowledging and refreshing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, sourceStatus: 'VERIFIED' }) }));
    render(<EnterpriseControlTower {...props} />);
    fireEvent.click(screen.getByRole('button', { name: '새로고침' }));
    await waitFor(() => expect(mocks.refresh).toHaveBeenCalledTimes(1));
    expect(mocks.success).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/admin/enterprises/refresh', expect.objectContaining({ cache: 'no-store', credentials: 'same-origin' }));
  });

  it('rejects success-shaped but unverified payloads', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) }));
    render(<EnterpriseControlTower {...props} />);
    fireEvent.click(screen.getByRole('button', { name: '새로고침' }));
    await waitFor(() => expect(mocks.error).toHaveBeenCalled());
    expect(mocks.success).not.toHaveBeenCalled();
    expect(mocks.refresh).not.toHaveBeenCalled();
  });
});
