import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StockOrderbook } from './stock-orderbook';

vi.mock('@/lib/use-market-prices', () => ({
  useQuote: (_stockId: string, fallback: unknown) => fallback,
  useStockTrades: () => [],
}));
vi.mock('@/lib/audio-effects', () => ({ playStockTickSound: vi.fn() }));

describe('verified execution history in the price ladder', () => {
  it('does not create five trade executions when the socket has none', () => {
    render(<StockOrderbook stockId="stock-1" currentPrice="15000" />);
    expect(screen.getByText(/확인된 실제 체결 내역이 없습니다/i)).toBeDefined();
    expect(screen.queryByText(/t-init-/i)).toBeNull();
  });
});
