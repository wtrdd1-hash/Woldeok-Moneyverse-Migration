import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocked = vi.hoisted(() => ({ apiOrNull: vi.fn(), requireMember: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: mocked.apiOrNull }));
vi.mock('@/lib/session', () => ({ requireMember: mocked.requireMember }));
vi.mock('@/lib/seo', () => ({ canonicalUrl: () => '/marketplace' }));
vi.mock('@/components/page-header', () => ({ PageHeader: ({ children }: { children: React.ReactNode }) => React.createElement('header', null, children) }));
vi.mock('@/components/translated-text', () => ({ TranslatedText: () => React.createElement('span', null, 'Marketplace') }));
vi.mock('@/components/empty-state', () => ({ EmptyState: ({ title }: { title: string }) => React.createElement('p', null, title) }));
vi.mock('./marketplace-tabs', () => ({ MarketplaceTabs: ({ userBalanceWld }: { userBalanceWld: string }) => React.createElement('div', { 'data-testid': 'verified-marketplace' }, userBalanceWld) }));

import MarketplacePage, { metadata } from './page';

beforeEach(() => {
  vi.clearAllMocks();
  mocked.apiOrNull.mockImplementation((path: string) => path.includes('holdings')
    ? Promise.resolve({ holdings: [] })
    : Promise.resolve({ balances: { cash: { availableAmount: '1234567890123456789012345' } } }));
});

describe('private marketplace readiness', () => {
  it('renders the exact owner balance and keeps the page out of search results', async () => {
    const html = renderToStaticMarkup(await MarketplacePage());
    expect(html).toContain('1234567890123456789012345');
    expect(html).toContain('data-testid="verified-marketplace"');
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(mocked.apiOrNull).toHaveBeenCalledWith('/api/v1/wallet');
  });

  it.each([null, { balance: '1000' }, { balances: { cash: { availableAmount: 'invalid' } } }])(
    'never invents a wallet balance on unavailable or invalid private API data', async (wallet) => {
      mocked.apiOrNull.mockImplementation((path: string) => path.includes('holdings')
        ? Promise.resolve({ holdings: [] })
        : Promise.resolve(wallet));
      const html = renderToStaticMarkup(await MarketplacePage());
      expect(html).toContain('마켓 자산 정보를 확인할 수 없습니다.');
      expect(html).not.toContain('data-testid="verified-marketplace"');
    },
  );

  it('does not misreport a failed holdings API as an empty inventory', async () => {
    mocked.apiOrNull.mockImplementation((path: string) => path.includes('holdings')
      ? Promise.resolve(null)
      : Promise.resolve({ balances: { cash: { availableAmount: '1000' } } }));
    const html = renderToStaticMarkup(await MarketplacePage());
    expect(html).toContain('마켓 자산 정보를 확인할 수 없습니다.');
    expect(html).not.toContain('data-testid="verified-marketplace"');
  });
});
