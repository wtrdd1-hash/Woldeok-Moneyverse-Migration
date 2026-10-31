import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const { apiOrNull, requireMember } = vi.hoisted(() => ({ apiOrNull: vi.fn(), requireMember: vi.fn(async () => undefined) }));
vi.mock('@/lib/api', () => ({ apiOrNull }));
vi.mock('@/lib/session', () => ({ requireMember }));
import WalletActivityPage from './page';
const row = { transactionId: '11111111-1111-4111-8111-111111111111', type: 'USER_TO_USER', label: 'transfer', netAmount: '-900719925474099312345', cashDelta: '-900719925474099312345', bankDelta: '0', direction: 'out', occurredAt: '2026-10-28T00:00:00.000Z' };
beforeEach(() => { vi.clearAllMocks(); apiOrNull.mockResolvedValue({ transactions: [row], hasMore: false, nextCursor: null, asOf: '2026-10-30T04:00:00.000Z' }); });
describe('member wallet minimum WLD amount filter', () => {
  it('preserves filters and verifies exact amount on owner-only screen', async () => {
    const html = renderToStaticMarkup(await WalletActivityPage({ searchParams: Promise.resolve({ period: '30d', direction: 'out', minAmount: '900719925474099312345' }) }));
    expect(requireMember).toHaveBeenCalledOnce();
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/wallet/activity?period=30d&direction=out&minAmount=900719925474099312345');
    expect(html).toContain('지갑 최소 WLD 순변동 검색');
    expect(html).toContain('minAmount=900719925474099312345');
    expect(html).toContain('900719925474099312345 WLD 이상');
  });
  it('never queries owner data on duplicate or malformed minAmount', async () => {
    const html = renderToStaticMarkup(await WalletActivityPage({ searchParams: Promise.resolve({ minAmount: ['1', '2'] }) }));
    expect(apiOrNull).not.toHaveBeenCalled();
    expect(html).toContain('role="alert"');
  });
  it('does not render fabricated below-floor HTTP 200 transactions', async () => {
    apiOrNull.mockResolvedValueOnce({ transactions: [{ ...row, netAmount: '-1', cashDelta: '-1' }], hasMore: false, nextCursor: null, asOf: '2026-10-30T04:00:00.000Z' });
    const html = renderToStaticMarkup(await WalletActivityPage({ searchParams: Promise.resolve({ minAmount: '2' }) }));
    expect(html).toContain('지금은 기록을 불러올 수 없어요.');
  });
});
