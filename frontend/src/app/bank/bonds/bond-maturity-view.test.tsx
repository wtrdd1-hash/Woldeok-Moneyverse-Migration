import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BondMaturityView } from './bond-maturity-view';

const verified = {
  asOf: '2026-10-25T00:00:00.000Z', holdingCount: 1,
  dueWithinSevenDays: 0, maturedUnredeemed: 1,
  totalPrincipalWld: '900719925474099312345678901234567890',
  totalMaturityWld: '900719925474099312345678901234567999',
  bonds: [{
    id: 'f0000000-0000-4000-8000-000000000001', bondCode: 'BOND_7D', bondName: '7-day bond',
    principalWld: '900719925474099312345678901234567890',
    maturityWld: '900719925474099312345678901234567999',
    maturityAt: '2026-10-24T00:00:00.000Z', maturityState: 'MATURED_UNREDEEMED' as const,
    redemptionVerified: false as const,
  }],
};

describe('member bond maturity view', () => {
  it('shows exact large balances and never represents maturity as completed redemption', () => {
    render(<BondMaturityView data={verified} isEn={false} />);
    expect(screen.getAllByText(/900,719,925,474,099,312,345,678,901,234,567,890/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/상환 미확인/).length).toBeGreaterThan(0);
    expect(screen.queryByText('지급 완료')).toBeNull();
  });
  it('distinguishes no holdings from failed verification', () => {
    const {rerender} = render(<BondMaturityView data={{...verified, bonds: [], holdingCount: 0, totalPrincipalWld: '0', totalMaturityWld: '0', maturedUnredeemed: 0}} isEn />);
    expect(screen.getByText(/No bond holdings/)).toBeDefined();
    rerender(<BondMaturityView data={null} isEn />);
    expect(screen.getByText(/unavailable/)).toBeDefined();
    expect(screen.queryByText(/No bond holdings/)).toBeNull();
  });
});
