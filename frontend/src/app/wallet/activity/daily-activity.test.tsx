import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WalletDailyActivity } from './daily-activity';

const huge = '90071992547409931234567890123456789012';

describe('WalletDailyActivity', () => {
  it('discloses the latest-50 sample limit, exact WLD amounts and UTC grouping', () => {
    render(<WalletDailyActivity data={{ scope: 'latest-50', inspectedTransactions: 50, days: [{
      date: '2026-10-24', transactionCount: 3, incomingAmount: huge,
      outgoingAmount: '2500', netAmount: (BigInt(huge) - 2500n).toString(), internalTransferCount: 1,
    }] }} />);
    expect(screen.getByText(/최대 50건/)).toBeDefined();
    expect(screen.getAllByText(/UTC/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/내부 이동 1건/)).toBeDefined();
    expect(screen.getByText(new RegExp('90,071,992,547,409,931,234,567,890,123,456,789,012'))).toBeDefined();
  });
  it('distinguishes unavailable service from no verified transactions', () => {
    const { rerender } = render(<WalletDailyActivity data={null} />);
    expect(screen.getByText(/불러올 수 없/)).toBeDefined();
    rerender(<WalletDailyActivity data={{ scope: 'latest-50', inspectedTransactions: 0, days: [] }} />);
    expect(screen.getByText(/최근 거래가 없/)).toBeDefined();
  });
});
