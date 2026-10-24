import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError } from '@/lib/api';
import { notFound } from 'next/navigation';
import LoanDetailPage, { metadata } from './page';

vi.mock('@/lib/api', () => ({
  api: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number) { super(`API ${status}`); this.status = status; }
  },
}));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => undefined) }));
vi.mock('next/navigation', () => ({ notFound: vi.fn(() => { throw new Error('NOT_FOUND'); }) }));

const ID = '22222222-2222-4222-8222-222222222222';
const ACTOR_LOAN = {
  loanId: ID,
  principalAmount: '90071992547409931234567890123456789012',
  interestAmount: '3',
  outstandingAmount: '90071992547409931234567890123456789012',
  status: 'active',
  issuedAt: '2026-10-24T00:00:00.000Z',
  repaidAt: null,
};

beforeEach(() => vi.clearAllMocks());

describe('private owner loan detail page', () => {
  it('shows verified exact-value loan details and an existing repayment entry point', async () => {
    vi.mocked(api).mockResolvedValue(ACTOR_LOAN);
    const html = renderToStaticMarkup(await LoanDetailPage({ params: Promise.resolve({ id: ID }) }));
    expect(api).toHaveBeenCalledWith(`/api/v1/bank/loans/${ID}`);
    expect(html).toContain(BigInt(ACTOR_LOAN.outstandingAmount).toLocaleString('en-US'));
    expect(html).toContain('내 지갑에서 상환하기');
    expect(html).toContain(ID);
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
  it('never renders a guessed empty loan after a service outage', async () => {
    vi.mocked(api).mockRejectedValue(new ApiError(503));
    const html = renderToStaticMarkup(await LoanDetailPage({ params: Promise.resolve({ id: ID }) }));
    expect(html).toContain('불러올 수 없어요');
    expect(html).not.toContain('확인된 대출 기록');
  });
  it('treats nonexistent and foreign loans identically', async () => {
    vi.mocked(api).mockRejectedValue(new ApiError(404));
    await expect(LoanDetailPage({ params: Promise.resolve({ id: ID }) })).rejects.toThrow('NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });
  it('rejects malformed loan IDs without calling the API', async () => {
    await expect(LoanDetailPage({ params: Promise.resolve({ id: 'not-an-id' }) })).rejects.toThrow('NOT_FOUND');
    expect(api).not.toHaveBeenCalled();
  });
});
