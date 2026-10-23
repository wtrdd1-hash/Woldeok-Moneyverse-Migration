import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const mocks = vi.hoisted(() => ({
  api: vi.fn(), member: vi.fn(async () => undefined),
  notFound: vi.fn((): never => { throw new Error('NEXT_NOT_FOUND'); }),
  redirect: vi.fn((url: string): never => { throw new Error('NEXT_REDIRECT:' + url); }),
}));

vi.mock('@/lib/api', () => ({
  api: mocks.api,
  ApiError: class ApiError extends Error {
    constructor(readonly status: number) { super('API failure'); }
  },
}));
vi.mock('@/lib/session', () => ({ requireMember: mocks.member }));
vi.mock('next/navigation', () => ({ notFound: mocks.notFound, redirect: mocks.redirect }));

import WalletHistoricalReceiptPage, { metadata } from './[transactionId]/page';
import WalletHistoricalLookup from './lookup/page';

const TX = '22222222-2222-4222-8222-222222222222';

beforeEach(() => { vi.clearAllMocks(); });

describe('private wallet historical receipt page', () => {
  it('renders a confirmed owner receipt and exact pocket movements without exposing other users', async () => {
    mocks.api.mockResolvedValue({
      receiptVersion: 1, state: 'CONFIRMED', transactionId: TX, currency: 'WLD', reason: '은행 입금',
      occurredAt: '2026-09-01T00:00:00Z', netWalletDelta: '0', cashDelta: '-2500', bankDelta: '2500',
      detailCompleteness: 'VERIFIED', historyScope: 'ALL_POSTED',
    });
    const html = renderToStaticMarkup(await WalletHistoricalReceiptPage({ params: Promise.resolve({ transactionId: TX }) }));
    expect(html).toContain('내 WLD 거래 확인');
    expect(html).toContain('2,500 WLD');
    expect(html).toContain(TX);
    expect(mocks.api).toHaveBeenCalledWith(`/api/v1/wallet/activity/${TX}`);
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });
  it('fails closed when the API returns a receipt for a different transaction reference', async () => {
    mocks.api.mockResolvedValue({
      receiptVersion: 1, state: 'CONFIRMED', transactionId: '33333333-3333-4333-8333-333333333333',
      currency: 'WLD', reason: '보상 지급', occurredAt: '2026-09-01T00:00:00Z',
      netWalletDelta: '100', cashDelta: '100', bankDelta: '0',
      detailCompleteness: 'VERIFIED', historyScope: 'ALL_POSTED',
    });
    const html = renderToStaticMarkup(await WalletHistoricalReceiptPage({ params: Promise.resolve({ transactionId: TX }) }));
    expect(html).toContain('거래 기록을 확인할 수 없습니다');
    expect(html).not.toContain('확인된 거래');
  });
  it('does not issue a database request for invalid transaction IDs', async () => {
    await expect(WalletHistoricalReceiptPage({ params: Promise.resolve({ transactionId: '../admin' }) })).rejects.toThrow('NEXT_NOT_FOUND');
    expect(mocks.api).not.toHaveBeenCalled();
  });
  it('does not claim confirmation when backend receipt is unavailable', async () => {
    mocks.api.mockRejectedValue(new Error('network unavailable'));
    const html = renderToStaticMarkup(await WalletHistoricalReceiptPage({ params: Promise.resolve({ transactionId: TX }) }));
    expect(html).toContain('거래 기록을 확인할 수 없습니다');
    expect(html).not.toContain('확인된 거래');
  });
  it('validates historical lookup before redirecting to the owner-only route', async () => {
    await expect(WalletHistoricalLookup({ searchParams: Promise.resolve({ transactionId: 'not-uuid' }) })).rejects.toThrow('NEXT_NOT_FOUND');
    await expect(WalletHistoricalLookup({ searchParams: Promise.resolve({ transactionId: TX }) })).rejects.toThrow(`NEXT_REDIRECT:/wallet/activity/${TX}`);
  });
});
