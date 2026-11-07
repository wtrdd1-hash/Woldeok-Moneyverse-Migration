import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { apiOrNull } from '@/lib/api';
import WalletPage from './page';

vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn().mockResolvedValue({ userId: '123e4567-e89b-42d3-a456-426614174000' }) }));
vi.mock('@/components/translated-text', () => ({ TranslatedText: ({ korean, english }: { korean: string; english?: string }) => <span data-en={english}>{korean}</span> }));

describe('authenticated wallet overview unavailable-state integration', () => {
  beforeEach(() => vi.mocked(apiOrNull).mockReset());

  it('does not crash or fabricate a zero WLD balance when the API supplies an invalid pocket', async () => {
    vi.mocked(apiOrNull).mockResolvedValueOnce({
      userId: '123e4567-e89b-42d3-a456-426614174000',
      balances: {
        currency: 'WLD', cash: { availableAmount: 'not-a-balance', updatedAt: '2026-11-02T00:00:00Z' },
        bank: { availableAmount: '0', updatedAt: '2026-11-02T00:00:00Z' }, totalAvailableAmount: '0',
      }, recentTransactions: [],
    });
    const html = renderToStaticMarkup(await WalletPage());
    expect(html).toContain('지금은 지갑을 불러올 수 없어요');
    expect(html).toContain('다시 조회');
    expect(html).toContain('data-en="Retry"');
    expect(html).toContain('href="/wallet"');
    expect(html).not.toContain('내 가상 자산 총액');
    expect(html).not.toContain('not-a-balance');
  });

  it('shows the same safe unavailable state when the owner API is down', async () => {
    vi.mocked(apiOrNull).mockResolvedValueOnce(null);
    const html = renderToStaticMarkup(await WalletPage());
    expect(html).toContain('지금은 지갑을 불러올 수 없어요');
    expect(html).toContain('다시 조회');
  });
});
