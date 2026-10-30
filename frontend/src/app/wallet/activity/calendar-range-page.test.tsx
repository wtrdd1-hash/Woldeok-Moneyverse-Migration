import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const { apiOrNull, requireMember } = vi.hoisted(() => ({
  apiOrNull: vi.fn(),
  requireMember: vi.fn(async () => undefined),
}));
vi.mock('@/lib/api', () => ({ apiOrNull }));
vi.mock('@/lib/session', () => ({ requireMember }));
import WalletActivityPage from './page';

beforeEach(() => {
  vi.clearAllMocks();
  apiOrNull.mockResolvedValue({
    transactions: [],
    hasMore: false,
    nextCursor: null,
    asOf: '2026-10-30T04:00:00.000Z',
  });
});
describe('owner wallet calendar UI', () => {
  it('renders labeled KST date controls and forwards canonical range with direction', async () => {
    const html = renderToStaticMarkup(
      await WalletActivityPage({
        searchParams: Promise.resolve({ from: '2026-10-28', to: '2026-10-30', direction: 'out' }),
      }),
    );
    expect(requireMember).toHaveBeenCalledOnce();
    expect(apiOrNull).toHaveBeenCalledWith(
      '/api/v1/wallet/activity?period=all&direction=out&from=2026-10-28&to=2026-10-30',
    );
    expect(html).toContain('type="date"');
    expect(html).toContain('name="from"');
    expect(html).toContain('name="to"');
    expect(html).toContain(
      'href="/wallet/activity?direction=in&amp;from=2026-10-28&amp;to=2026-10-30"',
    );
  });
  it('does not render a malformed HTTP 200 as verified owner ledger activity', async () => {
    apiOrNull.mockResolvedValueOnce({
      transactions: [{ transactionId: 'forged', netAmount: 123 }],
      hasMore: false,
      nextCursor: null,
      asOf: '2026-10-30T04:00:00.000Z',
    });
    const html = renderToStaticMarkup(
      await WalletActivityPage({
        searchParams: Promise.resolve({ from: '2026-10-28', to: '2026-10-30' }),
      }),
    );
    expect(html).toContain('지금은 기록을 불러올 수 없어요.');
    expect(html).not.toContain('forged');
  });
  it('rejects incomplete filters without silently returning unbounded ledger data', async () => {
    const html = renderToStaticMarkup(
      await WalletActivityPage({ searchParams: Promise.resolve({ from: '2026-10-28' }) }),
    );
    expect(apiOrNull).not.toHaveBeenCalled();
    expect(html).toContain('날짜');
  });
});
