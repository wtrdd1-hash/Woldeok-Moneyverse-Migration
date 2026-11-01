import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const { apiOrNull, requireMember } = vi.hoisted(() => ({ apiOrNull: vi.fn(), requireMember: vi.fn(async () => undefined) }));
vi.mock('@/lib/api', () => ({ apiOrNull }));
vi.mock('@/lib/session', () => ({ requireMember }));
import WalletActivityPage, { metadata } from './page';
const valid = {
  transactions: [{ transactionId: '11111111-1111-4111-8111-111111111111', type: 'BANK_DEPOSIT',
    label: 'Bank transfer', occurredAt: '2026-10-30T04:05:06.000Z', netAmount: '0',
    cashDelta: '-10', bankDelta: '10', direction: 'neutral' }],
  hasMore: false, nextCursor: null, asOf: '2026-10-30T05:00:00.000Z',
};
beforeEach(() => { vi.clearAllMocks(); apiOrNull.mockResolvedValue(valid); });

describe('wallet activity server-rendered owner proof', () => {
  it('renders verified private owner transfer and keeps noindex', async () => {
    const html = renderToStaticMarkup(await WalletActivityPage({ searchParams: Promise.resolve({ direction: 'neutral' }) }));
    expect(requireMember).toHaveBeenCalledOnce();
    expect(html).toContain('Bank transfer');
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.referrer).toBe('no-referrer');
  });
  it.each([
    { transactions: 'not-an-array' },
    { transactions: [{ ...valid.transactions[0], netAmount: 'bad-money' }] },
    { transactions: [{ ...valid.transactions[0], direction: 'out' }] },
    { transactions: [{ ...valid.transactions[0], transactionId: 'not-an-id' }] },
    { hasMore: true, nextCursor: null },
  ])('fails closed on malformed non-calendar HTTP 200 %j', async (patch) => {
    apiOrNull.mockResolvedValueOnce({ ...valid, ...patch });
    const html = renderToStaticMarkup(await WalletActivityPage({ searchParams: Promise.resolve({}) }));
    expect(html).toContain('지금은 기록을 불러올 수 없어요.');
    expect(html).not.toContain('Bank transfer');
    expect(html).not.toContain('아직 기록된 활동이 없어요.');
  });
  it('rejects mismatched server direction without leaking the row', async () => {
    const html = renderToStaticMarkup(await WalletActivityPage({ searchParams: Promise.resolve({ direction: 'out' }) }));
    expect(html).toContain('지금은 기록을 불러올 수 없어요.');
    expect(html).not.toContain('Bank transfer');
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('href="/wallet/activity?direction=out"');
    expect(html).toContain('다시 조회');
    expect(html).toContain('min-h-11');
  });
});
