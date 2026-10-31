import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { WalletService } from './wallet.service';
import type { WalletRepositoryLike } from './wallet.service';

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '33333333-3333-4333-8333-333333333333';
const at = new Date('2026-10-28T00:00:00.000Z');
const row = (id: number, net: string, cash?: string, bank?: string) => ({
  transaction_id: `00000000-0000-4000-8000-${String(id).padStart(12, '0')}`,
  type: 'USER_TO_USER',
  created_at: at,
  net_amount: net,
  ...(cash === undefined ? {} : { cash_delta: cash, bank_delta: bank }),
});
function service(rows: ReturnType<typeof row>[]) {
  const stub = vi.fn();
  return new WalletService(
    {
      balancesForUser: stub,
      recentTransactionsForUser: stub,
      activeRecipientById: stub,
      transfer: stub,
      claimDaily: stub,
      activityTransactionsForUser: vi.fn(async () => rows),
    } as unknown as WalletRepositoryLike,
    { clock: () => at },
  );
}
beforeEach(() =>
  vi.stubEnv('SESSION_SIGNING_KEY', 'wallet-summary-test-secret-adequate-length-123456789'),
);
afterEach(() => vi.unstubAllEnvs());
describe('owner wallet activity visible-page summary', () => {
  it('returns exact BigInt cash/bank/net sums of the visible rows only', async () => {
    const page = await service([
      row(1, '900719925474099312345', '900719925474099312345', '0'),
      row(2, '-900719925474099312344', '0', '-900719925474099312344'),
    ]).activityPage(OWNER, SESSION);
    expect(page.pageSummary).toEqual({
      scope: 'VISIBLE_PAGE_ONLY',
      transactionCount: 2,
      cashDelta: '900719925474099312345',
      bankDelta: '-900719925474099312344',
      netDelta: '1',
    });
  });
  it('returns verified zero for an empty page, but never invents zero when pocket proof is missing', async () => {
    expect((await service([]).activityPage(OWNER, SESSION)).pageSummary).toEqual({
      scope: 'VISIBLE_PAGE_ONLY',
      transactionCount: 0,
      cashDelta: '0',
      bankDelta: '0',
      netDelta: '0',
    });
    expect((await service([row(1, '7')]).activityPage(OWNER, SESSION)).pageSummary).toBeNull();
  });
  it('does not include the lookahead row in visible totals', async () => {
    const rows = Array.from({ length: 51 }, (_, i) => row(i + 1, '1', '1', '0'));
    const page = await service(rows).activityPage(OWNER, SESSION);
    expect(page.hasMore).toBe(true);
    expect(page.pageSummary?.transactionCount).toBe(50);
    expect(page.pageSummary?.netDelta).toBe('50');
  });
});
