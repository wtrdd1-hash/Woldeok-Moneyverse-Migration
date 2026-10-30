import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const { api, requireMember } = vi.hoisted(() => ({
  api: vi.fn(),
  requireMember: vi.fn(async () => undefined),
}));
vi.mock('@/lib/api', () => ({ api }));
vi.mock('@/lib/session', () => ({ requireMember }));
import WalletTransactionDetailPage, { metadata } from './page';
const TX = '55555555-5555-4555-8555-555555555555';
const good = {
  transactionId: TX,
  typeLabel: '은행 입금',
  occurredAtUtcMicros: '2026-10-30T04:05:06.123456Z',
  cashDelta: '-900719925474099312345',
  bankDelta: '900719925474099312345',
  netDelta: '0',
  currency: 'WLD',
  readStatus: 'READ_OK',
  reconciliationStatus: 'NOT_ASSESSED',
};
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('WALLET_TRANSACTION_DETAIL_ENABLED', 'true');
  api.mockResolvedValue(good);
});
afterEach(() => vi.unstubAllEnvs());
describe('owner-private wallet transaction detail page', () => {
  it('requires member and displays exact amounts, non-certification and noindex', async () => {
    const html = renderToStaticMarkup(
      await WalletTransactionDetailPage({ params: Promise.resolve({ transactionId: TX }) }),
    );
    expect(requireMember).toHaveBeenCalledOnce();
    expect(api).toHaveBeenCalledWith('/api/v1/wallet/activity/transactions/' + TX);
    expect(html.replaceAll(',', '')).toContain('900719925474099312345');
    expect(html).toContain('정산 검증서 아님');
    expect(html).toContain('aria-label=');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
  it('does not show fake zero or stale content on malformed 200', async () => {
    api.mockResolvedValueOnce({ ...good, netDelta: '5' });
    const html = renderToStaticMarkup(
      await WalletTransactionDetailPage({ params: Promise.resolve({ transactionId: TX }) }),
    );
    expect(html).toContain('확인할 수 없어요');
    expect(html).not.toContain('900719925474099312345');
  });
  it('does not query for invalid ID or feature OFF', async () => {
    await WalletTransactionDetailPage({ params: Promise.resolve({ transactionId: 'invalid' }) });
    expect(api).not.toHaveBeenCalled();
    vi.stubEnv('WALLET_TRANSACTION_DETAIL_ENABLED', 'false');
    await WalletTransactionDetailPage({ params: Promise.resolve({ transactionId: TX }) });
    expect(api).not.toHaveBeenCalled();
  });
});
