import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const { apiOrNull, requireMember } = vi.hoisted(() => ({
  apiOrNull: vi.fn(),
  requireMember: vi.fn(async () => undefined),
}));
vi.mock('@/lib/api', () => ({ apiOrNull }));
vi.mock('@/lib/session', () => ({ requireMember }));
import WalletActivityPage from './page';
const item = {
  transactionId: '11111111-1111-4111-8111-111111111111',
  type: 'USER_TO_USER',
  label: '송금',
  occurredAt: '2026-10-28T00:00:00.000Z',
  netAmount: '900719925474099312345',
  cashDelta: '900719925474099312345',
  bankDelta: '0',
  direction: 'in',
};
const base = {
  transactions: [item],
  hasMore: false,
  nextCursor: null,
  asOf: '2026-10-30T04:00:00.000Z',
};
beforeEach(() => vi.clearAllMocks());
describe('wallet activity visible page totals UI', () => {
  it('renders exact verified page-only net total with accessible scope warning', async () => {
    apiOrNull.mockResolvedValue({
      ...base,
      pageSummary: {
        scope: 'VISIBLE_PAGE_ONLY',
        transactionCount: 1,
        cashDelta: item.cashDelta,
        bankDelta: '0',
        netDelta: item.netAmount,
      },
    });
    const html = renderToStaticMarkup(
      await WalletActivityPage({ searchParams: Promise.resolve({}) }),
    );
    expect(requireMember).toHaveBeenCalledOnce();
    expect(html).toContain('현재 화면 1건');
    expect(html).toContain('이전 페이지와 전체 기간 합계가 아닙니다');
    expect(html).toContain('900,719,925,474,099,312,345');
  });
  it('never displays forged or missing totals as verified', async () => {
    apiOrNull.mockResolvedValue({
      ...base,
      pageSummary: {
        scope: 'VISIBLE_PAGE_ONLY',
        transactionCount: 1,
        cashDelta: '1',
        bankDelta: '0',
        netDelta: '1',
      },
    });
    const html = renderToStaticMarkup(
      await WalletActivityPage({ searchParams: Promise.resolve({}) }),
    );
    expect(html).toContain('합계를 검증할 수 없습니다');
    expect(html).not.toContain('현재 화면 1건');
  });
});
