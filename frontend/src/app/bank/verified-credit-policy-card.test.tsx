import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VerifiedCreditPolicyCard } from './verified-credit-policy-card';

const policy = {
  creditGrade: 'B', creditLimitWld: '900719925474099312345678901234567890',
  interestRateBps: 850, termDays: 30, minimumRepaymentWld: '1000000000000000000000',
  activeLoanOutstandingWld: null, activeLoanStatus: null, hasActiveLoan: false,
  canRequestNewLoan: true, source: 'BANK_STANDING' as const,
};

describe('verified credit policy card', () => {
  it('renders exact large limits and discloses no invented credit score or approval', () => {
    render(<VerifiedCreditPolicyCard policy={policy} />);
    expect(screen.getByText(/900,719,925,474,099,312,345,678,901,234,567,890/)).toBeDefined();
    expect(screen.getByText(/신청 가능 여부는 실행 시 재검증/)).toBeDefined();
    expect(screen.queryByText(/1,000점/)).toBeNull();
    expect(screen.getByRole('link', { name: /자세히/ }).getAttribute('href')).toBe('/bank/credit-policy');
  });

  it('does not advertise new borrowing when the member has an overdue loan', () => {
    render(<VerifiedCreditPolicyCard policy={{ ...policy, activeLoanStatus: 'overdue', activeLoanOutstandingWld: '99', hasActiveLoan: true, canRequestNewLoan: false }} />);
    expect(screen.getByText(/연체 중인 가상 대출/)).toBeDefined();
    expect(screen.queryByText('신규 신청 가능')).toBeNull();
  });

  it('fails closed without server-verified policy', () => {
    render(<VerifiedCreditPolicyCard policy={null} />);
    expect(screen.getByText(/검증된 대출 정책을 불러올 수 없습니다/)).toBeDefined();
    expect(screen.queryByText('신규 신청 가능')).toBeNull();
  });
});
