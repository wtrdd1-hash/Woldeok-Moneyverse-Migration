import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { walletActivityApiPath, walletActivityPageHref } from './wallet-filters';
import WalletActivityPage from './page';
const { apiOrNull, requireMember } = vi.hoisted(() => ({
  apiOrNull: vi.fn(async () => ({ recentTransactions: [] })),
  requireMember: vi.fn(async () => undefined),
}));
vi.mock('@/lib/api', () => ({ apiOrNull }));
vi.mock('@/lib/session', () => ({ requireMember }));
describe('composed wallet filter navigation', () => {
  it('preserves validated direction, category and period across API and links', async () => {
    const filters = { direction: 'out' as const, category: 'bank' as const, period: '7d' as const };
    expect(walletActivityApiPath(filters)).toBe('/api/v1/wallet?recent=50&direction=out&category=bank&period=7d');
    expect(walletActivityPageHref(filters)).toBe('/wallet/activity?direction=out&category=bank&period=7d');
    const html = renderToStaticMarkup(await WalletActivityPage({ searchParams: Promise.resolve(filters) }));
    expect(requireMember).toHaveBeenCalled();
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/wallet?recent=50&direction=out&category=bank&period=7d');
    expect(html).toContain('name="direction"');
    expect(html).toContain('name="period"');
    expect(html).toContain('aria-current="page"');
  });
  it('rejects injected and repeated query parameters', async () => {
    await WalletActivityPage({ searchParams: Promise.resolve({ direction: 'out&owner=other', category: ['bank', 'reward'], period: '7d%26recent%3D999' }) });
    expect(apiOrNull).toHaveBeenLastCalledWith('/api/v1/wallet?recent=50');
  });
});
