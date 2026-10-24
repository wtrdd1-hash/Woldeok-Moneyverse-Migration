import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import CreditPolicyPage, { dynamic, metadata } from './page';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';

vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn() }));

beforeEach(() => {
  vi.mocked(requireMember).mockResolvedValue(undefined as never);
  vi.mocked(apiOrNull).mockReset();
});

describe('private verified credit policy report', () => {
  it('requires a member and never indexes or caches a personal banking report', async () => {
    vi.mocked(apiOrNull).mockResolvedValue({
      creditGrade: 'new', creditLimitWld: '1234567890123456789012345',
      interestRateBps: 900, termDays: 30, minimumRepaymentWld: '0',
      activeLoanOutstandingWld: null, activeLoanStatus: null, hasActiveLoan: false,
      canRequestNewLoan: true, source: 'BANK_STANDING',
    });
    const html = renderToStaticMarkup(await CreditPolicyPage());
    expect(requireMember).toHaveBeenCalledTimes(1);
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/banking/credit-policy');
    expect(dynamic).toBe('force-dynamic');
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(html).toContain('1,234,567,890,123,456,789,012,345');
    expect(html).not.toContain('1,000점');
  });

  it('renders unavailable rather than synthetic bank figures when API fails', async () => {
    vi.mocked(apiOrNull).mockResolvedValue(null);
    const html = renderToStaticMarkup(await CreditPolicyPage());
    expect(html).toContain('검증된 대출 정책을 불러올 수 없습니다');
    expect(html).not.toContain('신규 신청 가능');
  });
});
