import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
const { apiOrNull, requireMember } = vi.hoisted(() => ({
  apiOrNull: vi.fn(),
  requireMember: vi.fn(async () => undefined),
}));
vi.mock('@/lib/api', () => ({ apiOrNull }));
vi.mock('@/lib/session', () => ({ requireMember }));
import WalletActivityPage from './page';
const TX = '55555555-5555-4555-8555-555555555555';
beforeEach(() => {
  vi.clearAllMocks();
  apiOrNull.mockResolvedValue({
    transactions: [
      {
        transactionId: TX,
        type: 'BANK_DEPOSIT',
        label: '은행 입금',
        netAmount: '0',
        cashDelta: '-10',
        bankDelta: '10',
        direction: 'neutral',
        occurredAt: '2026-10-30T04:05:06Z',
      },
    ],
    hasMore: false,
    nextCursor: null,
    asOf: '2026-10-30T04:05:06Z',
  });
});
afterEach(() => vi.unstubAllEnvs());
describe('wallet detail CTA', () => {
  it('links only owner ledger rows when feature enabled', async () => {
    vi.stubEnv('WALLET_TRANSACTION_DETAIL_ENABLED', 'true');
    const html = renderToStaticMarkup(await WalletActivityPage({}));
    expect(html).toContain('/wallet/activity/transactions/' + TX);
    expect(html).toContain('거래 상세 보기');
  });
  it('does not advertise an unavailable detail endpoint', async () => {
    vi.stubEnv('WALLET_TRANSACTION_DETAIL_ENABLED', 'false');
    const html = renderToStaticMarkup(await WalletActivityPage({}));
    expect(html).not.toContain('/wallet/activity/transactions/' + TX);
  });
});
