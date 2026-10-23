import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import WalletActivityPage from './page';

const { apiOrNull, requireMember } = vi.hoisted(() => ({
  apiOrNull: vi.fn(async () => ({ recentTransactions: [] })),
  requireMember: vi.fn(async () => undefined),
}));
vi.mock('@/lib/api', () => ({ apiOrNull }));
vi.mock('@/lib/session', () => ({ requireMember }));

describe('wallet activity direction filter page', () => {
  it('requests owner wallet with direction and marks active filter for assistive technology', async () => {
    const markup = renderToStaticMarkup(await WalletActivityPage({ searchParams: Promise.resolve({ direction: 'in' }) }));
    expect(requireMember).toHaveBeenCalled();
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/wallet?recent=50&direction=in');
    expect(markup).toContain('href="/wallet/activity?direction=in"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('최근 기록 최대 50건');
  });

  it('does not interpolate untrusted search parameters into the private API', async () => {
    await WalletActivityPage({ searchParams: Promise.resolve({ direction: 'in&userId=other' }) });
    expect(apiOrNull).toHaveBeenLastCalledWith('/api/v1/wallet?recent=50');
  });
});
