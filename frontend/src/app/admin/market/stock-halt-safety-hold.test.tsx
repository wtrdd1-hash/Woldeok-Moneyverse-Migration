import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AdminStock } from '../types';

vi.mock('../actions', () => ({
  haltStockAndSettle: vi.fn(),
  retryHaltSettlement: vi.fn(),
}));

import { HaltStockDialog } from './admin-market-halt-dialog';

afterEach(cleanup);

const stock = {
  id: '22222222-2222-4222-8222-222222222222',
  symbol: 'WDX',
  name: 'Sample stock',
  current_price: '100',
  holders: 2,
} as AdminStock;

describe('stock halt financial safety hold', () => {
  it('explains the atomicity hold and does not expose a settlement submission', () => {
    render(<HaltStockDialog stock={stock} />);
    fireEvent.click(screen.getByRole('button', { name: /거래정지/ }));
    expect(screen.getByRole('alert').textContent).toContain('원장');
    expect(screen.queryByRole('button', { name: /원가정산 확정/ })).toBeNull();
  });
});
