import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StockHaltBanner } from './stock-halt-banner';

const mockReceipt = {
  id: 'receipt-1111-2222-3333-4444',
  halt_event_id: 'halt-event-5555',
  stock_id: 'stock-wldk',
  stock_symbol: 'WLDK',
  stock_name: '월덕 코퍼레이션',
  quantity: '500',
  basis_method: 'AVERAGE_COST',
  basis_unit_amount: '1250',
  refund_amount: '625000',
  status: 'SETTLED',
  created_at: '2026-09-26T12:00:00Z',
};

describe('StockHaltBanner & StockHaltReceiptDialog Component Tests', () => {
  it('StockHaltBanner renders halt warning and receipt trigger button', () => {
    render(
      <StockHaltBanner
        symbol="WLDK"
        name="월덕 코퍼레이션"
        haltStatus="HALTED_SETTLED"
        receipt={mockReceipt}
        isEn={false}
      />,
    );

    expect(screen.getByText(/WLDK 종목 거래정지 · 매수원가 자동정산 안내/i)).toBeDefined();
    expect(screen.getByText(/원가 환급 영수증 조회/i)).toBeDefined();
  });

  it('StockHaltBanner renders English translation when isEn is true', () => {
    render(
      <StockHaltBanner
        symbol="WLDK"
        name="Woldeok Corp"
        haltStatus="HALTED_SETTLED"
        receipt={mockReceipt}
        isEn={true}
      />,
    );

    expect(screen.getByText(/WLDK Trading Halted · Cost-Basis Settlement Active/i)).toBeDefined();
    expect(screen.getByText(/View Refund Receipt/i)).toBeDefined();
  });
});
