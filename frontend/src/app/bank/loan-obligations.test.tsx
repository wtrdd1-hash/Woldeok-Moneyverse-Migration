import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LoanObligationsCard } from './loan-obligations-card';

const summary = {
  currency: 'WLD' as const,
  loanCount: 3, activeCount: 1, overdueCount: 1, repaidCount: 1,
  outstandingAmount: '900719925474099312345678901234567890',
  overdueOutstandingAmount: '15',
};

describe('verified virtual loan obligations', () => {
  it('renders exact outstanding amount and overdue count', () => {
    const html = renderToStaticMarkup(<LoanObligationsCard summary={summary} isEn />);
    expect(html).toContain('900,719,925,474,099,312,345,678,901,234,567,890');
    expect(html).toContain('Overdue: 1');
  });
  it('does not replace unavailable owner data with invented zero', () => {
    const html = renderToStaticMarkup(<LoanObligationsCard summary={null} isEn />);
    expect(html).toContain('Cannot load loan obligations');
    expect(html).not.toContain('0 WLD');
  });
});
