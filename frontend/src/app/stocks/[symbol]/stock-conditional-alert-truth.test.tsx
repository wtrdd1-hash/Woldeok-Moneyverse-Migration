import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { StockConditionalOrders } from './stock-conditional-orders';

const props = {
  stockId: '6eecf913-9a47-4a2b-851f-74b90efc802e',
  symbol: 'WDG',
  name: 'Woldeok Games',
  currentPrice: '15000',
  holdingQuantity: '100',
};

describe('stock conditional alert source truth', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('uses the server-backed price alert entry rather than claiming automatic sell execution', () => {
    render(<StockConditionalOrders {...props} />);
    expect(screen.getByRole('button', { name: /조건부 알림 설정/ })).toBeDefined();
    expect(screen.getByRole('link', { name: /내 가격 알림 보기/ }).getAttribute('href')).toBe('/stocks/alerts');
    expect(screen.getByText(/자동 매도 주문을 실행하지 않습니다/)).toBeDefined();
    expect(screen.queryByRole('button', { name: /손절 감시 주문 등록/ })).toBeNull();
  });

  it('opens the existing authenticated price alert form instead of a browser-only order form', () => {
    render(<StockConditionalOrders {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /조건부 알림 설정/ }));
    expect(screen.getByRole('button', { name: /알림 등록하기/ })).toBeDefined();
    expect(screen.getByText(/목표 가격 \(WLD\)/)).toBeDefined();
    const stockId = document.querySelector('input[name="stockId"]') as HTMLInputElement | null;
    expect(stockId?.value).toBe(props.stockId);
  });

  it('never interprets a previous browser-only rule as an executed trade or persisted server alert', () => {
    window.localStorage.setItem('mv_stock_conditional_orders_WDG', JSON.stringify([{
      id: 'legacy-rule', stockId: props.stockId, symbol: 'WDG', type: 'stop_loss',
      triggerPrice: 16000, quantity: 100, status: 'TRIGGERED', createdAt: '12:00',
    }]));
    render(<StockConditionalOrders {...props} currentPrice="14000" />);
    expect(screen.getByText(/기존 브라우저 감시 규칙은 서버 주문이나 체결 기록이 아닙니다/)).toBeDefined();
    expect(screen.queryByText(/자동 체결되었습니다/)).toBeNull();
    expect(screen.queryByText(/legacy-rule/)).toBeNull();
    expect(window.localStorage.getItem('mv_stock_conditional_orders_WDG')).not.toBeNull();
  });

  it('explains the notification-only contract in English and provides accessible navigation', () => {
    render(<StockConditionalOrders {...props} isEn isHalted />);
    expect(screen.getByText(/does not place automatic sell orders/i)).toBeDefined();
    expect(screen.getByRole('link', { name: /View my price alerts/ }).getAttribute('href')).toBe('/stocks/alerts');
    expect(screen.getByRole('status')).toBeDefined();
  });
});
