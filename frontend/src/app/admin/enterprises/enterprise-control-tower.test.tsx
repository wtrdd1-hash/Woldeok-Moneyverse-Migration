import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { harvest, update } = vi.hoisted(() => ({ harvest: vi.fn(), update: vi.fn() }));
vi.mock('./actions', () => ({ harvestEnterpriseDividends: harvest, updateEnterpriseStatus: update }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

import { EnterpriseControlTower } from './enterprise-control-tower';

const overview = {
  holding_name: 'Test', holding_code: 'WSHC', total_soe_assets_wld: '100',
  hourly_soe_revenue_wld: '10', hourly_soe_profit_wld: '8',
  hourly_soe_dividends_wld: '2', total_private_enterprises: 0,
  total_private_valuation_wld: '0', hourly_corporate_tax_wld: '0', governance_model: 'test',
};

describe('SOE administrator payout retry identity', () => {
  beforeEach(() => { harvest.mockReset(); update.mockReset(); });

  it('reuses one operation UUID after an ambiguous failure and rotates only on confirmed receipt', async () => {
    harvest.mockResolvedValueOnce({ ok: false, error: 'network timeout' })
      .mockResolvedValueOnce({ ok: true, receipt: {
        total_dividends_collected: '12', enterprises_processed: 1, treasury_balance_after: '1012',
      }, logs: [] })
      .mockResolvedValueOnce({ ok: true, receipt: {
        total_dividends_collected: '0', enterprises_processed: 0, treasury_balance_after: '1012',
      }, logs: [] });
    render(<EnterpriseControlTower initialOverview={overview} initialSoes={[]}
      initialPrivate={[]} initialDividendLogs={[]} />);
    const button = screen.getByRole('button', { name: /공기업 배당 국고 즉시 수취/ });
    fireEvent.click(button);
    await waitFor(() => expect(harvest).toHaveBeenCalledTimes(1));
    await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(button);
    await waitFor(() => expect(harvest).toHaveBeenCalledTimes(2));
    await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false));
    expect(harvest.mock.calls[0]?.[0]).toMatch(/^[0-9a-f-]{36}$/);
    expect(harvest.mock.calls[1]?.[0]).toBe(harvest.mock.calls[0]?.[0]);
    fireEvent.click(button);
    await waitFor(() => expect(harvest).toHaveBeenCalledTimes(3));
    expect(harvest.mock.calls[2]?.[0]).not.toBe(harvest.mock.calls[1]?.[0]);
  });
});
