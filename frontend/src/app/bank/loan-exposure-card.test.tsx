import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LoanExposureCard } from './loan-exposure-card';

describe('loan exposure card', () => {
  it('renders verified owner debt and overdue amount without precision loss', () => {
    const huge = '90071992547409931234567890123456789012';
    const html = renderToStaticMarkup(<LoanExposureCard summary={{ scope: 'latest-20', totalLoans: 3, activeCount: 1, overdueCount: 1, repaidCount: 1,
      outstandingAmount: huge, overdueAmount: '25', currency: 'WLD' }} />);
    expect(html).toContain('90,071,992,547,409,931,234,567,890,123,456,789,012');
    expect(html).toContain('연체 1건');
    expect(html).toContain('25 WLD');
    expect(html).toContain('최대 20건');
  });

  it('shows an unavailable state, not an invented zero, on API failure', () => {
    const html = renderToStaticMarkup(<LoanExposureCard summary={null} />);
    expect(html).toContain('조회할 수 없어요');
    expect(html).not.toContain('0 WLD');
  });
});
