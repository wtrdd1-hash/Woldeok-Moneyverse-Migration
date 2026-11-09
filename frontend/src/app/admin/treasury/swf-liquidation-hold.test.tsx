import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));
import { SwfControlPanel } from './swf-control-panel';

afterEach(cleanup);

describe('SWF admin manual liquidation truth / C v1136', () => {
  it('never labels modeled SWF AUM or compounding as settled investment on an enabled policy', () => {
    render(<SwfControlPanel initialConfig={{ is_enabled: true, safe_reserve_wld: '10000000', max_single_investment_wld: '10000000', equity_ratio_pct: 50, bond_ratio_pct: 30, dividend_ratio_pct: 20 }} />);
    expect(screen.getByText(/자동투자 실거래 정산 대기/)).toBeTruthy();
    expect(screen.getByText(/기존 포트폴리오 평가액/)).toBeTruthy();
    const liquidation = screen.getByRole('button', { name: /평가액 환원 불가/ }) as HTMLButtonElement;
    const rebalance = screen.getByRole('button', { name: /실거래 검증 전 리밸런싱 보류/ }) as HTMLButtonElement;
    expect(liquidation.disabled).toBe(true);
    expect(rebalance.disabled).toBe(true);
    expect(screen.queryByText(/자율 구동 중 \(1시간 주기\)/)).toBeNull();
  });

  it('shows a disabled manual liquidation control and accessible ledger hold notice', () => {
    render(<SwfControlPanel initialConfig={{ is_enabled: false, safe_reserve_wld: '25000000', max_single_investment_wld: '10000000', equity_ratio_pct: 0, bond_ratio_pct: 0, dividend_ratio_pct: 0 }} />);
    const button = screen.getByRole('button', { name: /수동 회수.*원장 검증.*중단/ }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(screen.getByRole('status').textContent).toMatch(/원장.*검증.*영수증/);
    expect(screen.queryByRole('button', { name: /주식 자금 즉시 회수/ })).toBeNull();
  });
});
