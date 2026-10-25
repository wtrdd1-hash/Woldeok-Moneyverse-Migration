import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { VerifiedStockDepth } from './verified-stock-depth';
import { StockTradingConsole } from './stock-trading-console';

vi.mock('./stock-order-panel', () => ({ StockOrderPanel: () => <div>Manual order form</div> }));
vi.mock('./stock-micro-portfolio', () => ({ StockMicroPortfolio: () => <div>Holdings</div> }));
vi.mock('./stock-conditional-orders', () => ({ StockConditionalOrders: () => <div>Conditional order form</div> }));

describe('verified stock depth', () => {
  it('shows an accessible no-depth notice and an exact large quote without synthetic liquidity', () => {
    render(<VerifiedStockDepth currentPrice="9007199254740993" status={{ status: 'UNAVAILABLE', source: 'NO_VERIFIED_OPEN_ORDERS', bids: [], asks: [] }} />);
    expect(screen.getByRole('status').textContent).toContain('검증된 호가 잔량');
    expect(screen.getByText(/9,007,199,254,740,993/)).toBeDefined();
    expect(screen.queryByText(/체결강도|매도 \d+%|매수 \d+%|실시간 호가/)).toBeNull();
    expect(screen.queryByRole('button', { name: /매수 주문 입력|매도 주문 입력/ })).toBeNull();
  });

  it('the actual trading console never mounts the synthetic orderbook', () => {
    render(<StockTradingConsole
      stockId="11111111-1111-4111-8111-111111111111"
      symbol="WDG" name="Woldeok" currentPrice="15000"
      depthStatus={{ status: 'UNAVAILABLE', source: 'NO_VERIFIED_OPEN_ORDERS', bids: [], asks: [] }}
    />);
    expect(screen.getByRole('status').textContent).toContain('검증된 호가 잔량');
    expect(screen.queryByText(/5단계 실시간 호가|체결강도|최근 체결 틱/)).toBeNull();
    expect(screen.queryByRole('button', { name: '10D' })).toBeNull();
  });

  it('does not mistake API failure for an empty verified book', () => {
    render(<VerifiedStockDepth currentPrice="15000" status={null} isEn />);
    expect(screen.getByRole('alert').textContent).toContain('Depth status could not be verified');
  });
});
