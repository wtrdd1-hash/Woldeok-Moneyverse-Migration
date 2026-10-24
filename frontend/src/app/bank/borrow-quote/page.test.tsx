import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import BorrowQuotePage, { metadata } from './page';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';

vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn() }));

const quote = { eligible: true, principalWld: '101', interestWld: '5', totalDueWld: '106', creditLimitWld: '500000', interestRateBps: 450, termDays: 30, binding: false, notice: 'Read-only estimate' };

beforeEach(() => {
  vi.mocked(requireMember).mockReset();
  vi.mocked(apiOrNull).mockReset();
  vi.mocked(requireMember).mockResolvedValue(undefined as never);
});

describe('borrow quote page authenticated web flow', () => {
  it('requires a member and reads the quote from the authenticated API', async () => {
    vi.mocked(apiOrNull).mockResolvedValue(quote);
    const html = renderToStaticMarkup(await BorrowQuotePage({ searchParams: Promise.resolve({ amount: '101' }) }));
    expect(requireMember).toHaveBeenCalledOnce();
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/banking/borrow-quote?amount=101');
    expect(html).toContain('예상 총상환액');
    expect(html).toContain('실제 대출이 아닙니다');
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });
  it('does not call the bank API for malformed input', async () => {
    const html = renderToStaticMarkup(await BorrowQuotePage({ searchParams: Promise.resolve({ amount: '1e8' }) }));
    expect(apiOrNull).not.toHaveBeenCalled();
    expect(html).toContain('올바른 정수');
  });
  it('does not display a successful quote when bank API is unavailable', async () => {
    vi.mocked(apiOrNull).mockResolvedValue(null);
    const html = renderToStaticMarkup(await BorrowQuotePage({ searchParams: Promise.resolve({ amount: '101' }) }));
    expect(html).toContain('은행 정책을 조회할 수 없습니다');
    expect(html).not.toContain('예상 총상환액');
  });
});
