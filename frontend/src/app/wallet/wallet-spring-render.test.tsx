import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

/**
 * Production regression 2026-11-25 (digest 3319858667): the signed-in wallet
 * threw on the Spring envelope. Render the whole server page against the
 * exact shape WalletService produces.
 */
const responses: Record<string, unknown> = {};
vi.mock('@/lib/api', () => ({
  apiOrNull: async (path: string) => {
    const key = Object.keys(responses).find((k) => path.startsWith(k));
    return key ? responses[key] : null;
  },
}));
vi.mock('@/lib/session', () => ({ requireMember: async () => ({ signedIn: true }) }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }), usePathname: () => '/wallet', useSearchParams: () => new URLSearchParams() }));

const { default: WalletPage } = await import('./page');

describe('wallet page against the Spring API', () => {
  it('renders balances from the Spring envelope and marks an unanswered portfolio 확인 불가', async () => {
    responses['/api/v1/wallet'] = {
      success: true,
      data: { balanceWld: '1500', pendingBalanceWld: '1000', lockedBalanceWld: '500', currency: 'WLD', userId: '6f1c1d36-8d0a-4a39-9d65-1a2b3c4d5e6f', recentTransactions: [] },
    };
    const html = renderToStaticMarkup(await WalletPage());
    expect(html).toContain('1,000');
    expect(html).toContain('500');
    expect(html).toContain('확인 불가');
    expect(html).toContain('주식 평가액을 확인하지 못해 제외했어요');
  });

  it('shows the unavailable state, not a crash, for an unknown body', async () => {
    responses['/api/v1/wallet'] = { status: 503 };
    const html = renderToStaticMarkup(await WalletPage());
    expect(html).toContain('지금은 지갑을 불러올 수 없어요');
  });
});
