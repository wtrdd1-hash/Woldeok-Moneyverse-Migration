import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BorrowQuoteCard } from './borrow-quote-card';

describe('new loan quote transparency', () => {
  it('shows exact principal, rounded-up interest, and not-a-loan disclaimer', () => {
    render(<BorrowQuoteCard quote={{ eligible: true, principalWld: '90071992547409931234567', interestWld: '405323966463344690556', totalDueWld: '90477316513873275925123', creditLimitWld: '999999999999999999999999', interestRateBps: 450, termDays: 30, binding: false, notice: 'Read-only estimate' }} />);
    expect(screen.getByText(/90,071,992,547,409,931,234,567/)).toBeDefined();
    expect(screen.getByText(/4.50%/)).toBeDefined();
    expect(screen.getByText(/실제 대출이 아닙니다/)).toBeDefined();
  });
  it('never shows a positive quote when the server denies borrowing', () => {
    render(<BorrowQuoteCard quote={{ eligible: false, reason: 'ACTIVE_LOAN', creditLimitWld: '500000', interestRateBps: 450, termDays: 30, binding: false, notice: 'Read-only estimate' }} />);
    expect(screen.getByText(/기존 대출/)).toBeDefined();
    expect(screen.queryByText(/예상 총상환액/)).toBeNull();
  });
});
