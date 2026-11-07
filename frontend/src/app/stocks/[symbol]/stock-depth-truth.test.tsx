import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StockOrderbook } from './stock-orderbook';

describe('stock depth provenance', () => {
  it('shows an unavailable depth status instead of synthetic orders or trades', () => {
    render(<StockOrderbook stockId="00000000-0000-4000-8000-000000000001" currentPrice="15,000" />);
    expect(screen.getByRole('status').textContent).toMatch(/호가.*검증|호가.*제공|호가.*확인/);
    expect(screen.queryByText(/체결강도/)).toBeNull();
    expect(screen.queryByText(/최근 체결 틱/)).toBeNull();
  });
});
