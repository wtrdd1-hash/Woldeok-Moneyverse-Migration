import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StockOrderbook } from './stock-orderbook';

describe('stock orderbook source hold', () => {
  it('shows the reported quote without inventing a bid, ask, or execution', () => {
    render(<StockOrderbook stockId="00000000-0000-4000-8000-000000000001" currentPrice="1,234,567" isEn />);
    expect(screen.getByText('1,234,567 WLD')).toBeDefined();
    expect(screen.getByRole('status').textContent).toMatch(/order depth/i);
    expect(screen.queryByText(/intensity|spread|recent trades/i)).toBeNull();
  });
});
