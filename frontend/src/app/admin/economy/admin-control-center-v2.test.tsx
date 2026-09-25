import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./actions', () => ({
  toggleKillswitchAction: vi.fn(),
  updateKnobsV2Action: vi.fn(),
  inspectUserAction: vi.fn(),
  overrideUserAssetAction: vi.fn(),
}));

import { AdminControlCenterV2 } from './admin-control-center-v2';
import type { MacroEconomyV2 } from './macro-v2-types';

afterEach(cleanup);

function data(auto = true): MacroEconomyV2 {
  return {
    m2_supply: '100000',
    cash_total: '60000',
    bank_total: '40000',
    faucet_today: '1000',
    sink_today: '750',
    net_flow_today: '250',
    inflation_ratio: 1.02,
    inflation_alert: false,    policy: {
      id: 7,
      master_killswitch_active: false,
      auto_balancing_active: auto,
      banking_circuit_broken: false,
      businesses_circuit_broken: false,
      market_circuit_broken: false,
      daily_deposit_interest_bps: 125,
      bond_7d_yield_bps: 650,
      bond_30d_yield_bps: 1500,
      loan_daily_interest_bps: 275,
      inflation_threshold_ratio: 1.1,
      last_auto_balanced_at: '2026-09-25T02:00:00Z',
      auto_balance_log: null,
      updated_at: '2026-09-25T03:00:00Z',
      updated_by: null,
    },
    jobs_stats: [],
    businesses_stats: [],
    bonds_stats: {
      holding_count: 2,
      holding_principal: '25000',
      redeemed_count: 1,
      redeemed_amount: '5000',
    },
    loans_stats: {
      active_count: 1,
      active_outstanding: '3000',
      repaid_count: 4,
    },
  };
}
describe('AdminControlCenterV2 policy ownership', () => {
  it('renders AUTO-owned policy rates as read-only until explicit manual override', () => {
    render(<AdminControlCenterV2 initialData={data(true)} />);

    const sliders = screen.getAllByRole('slider') as HTMLInputElement[];
    expect(sliders).toHaveLength(4);
    for (const slider of sliders) expect(slider.disabled).toBe(true);

    expect(screen.getByText('AUTO · 자동 제어')).toBeDefined();
    expect(screen.getAllByText('최소 0.00%').length).toBeGreaterThan(0);
    expect(screen.getByText('현재 125 bps')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: '수동 오버라이드 편집' }));

    for (const slider of sliders) expect(slider.disabled).toBe(false);
    expect((screen.getByRole('button', { name: '수동 오버라이드 값 적용' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('keeps MANUAL-owned policy rates directly editable', () => {
    render(<AdminControlCenterV2 initialData={data(false)} />);
    expect(screen.getByText('MANUAL · 수동 제어')).toBeDefined();
    for (const slider of screen.getAllByRole('slider') as HTMLInputElement[]) expect(slider.disabled).toBe(false);
    expect(screen.queryByRole('button', { name: '수동 오버라이드 편집' })).toBeNull();
  });
});
