import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const mocks = vi.hoisted(() => ({
  apiOrNull: vi.fn(),
  requireMember: vi.fn(async () => undefined),
}));

vi.mock('@/lib/api', () => ({ apiOrNull: mocks.apiOrNull }));
vi.mock('@/lib/session', () => ({ requireMember: mocks.requireMember }));
vi.mock('@/components/page-header', () => ({
  PageHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
}));
vi.mock('@/components/translated-text', () => ({
  TranslatedText: ({ korean }: { korean: string }) => <span>{korean}</span>,
}));
vi.mock('./marketplace-tabs', () => ({
  MarketplaceTabs: (props: {
    askingSnapshot: unknown;
    userBalanceWld: string;
    walletVerified: boolean;
  }) => <pre data-testid="verified-marketplace-props">{JSON.stringify(props)}</pre>,
}));

import MarketplacePage, { metadata } from './page';

describe('marketplace authenticated server read integration', () => {
  beforeEach(() => mocks.apiOrNull.mockReset());

  it('uses owner wallet and real active-listing endpoints, not nonexistent wallet summary', async () => {
    mocks.apiOrNull.mockImplementation(async (path: string) => {
      if (path === '/api/v1/shop/holdings') return { holdings: [] };
      if (path === '/api/v1/wallet?recent=1') return { balances: { cash: { availableAmount: '12345' } } };
      if (path === '/api/v1/marketplace/listings?limit=50') return [{
        id: '11111111-1111-4111-8111-111111111111',
        status: 'ACTIVE', price_wld: '1250.0000', quantity: 1,
        created_at: '2026-10-26T00:00:00Z',
      }];
      return null;
    });
    const html = renderToStaticMarkup(await MarketplacePage());
    expect(mocks.requireMember).toHaveBeenCalled();
    expect(mocks.apiOrNull).toHaveBeenCalledWith('/api/v1/wallet?recent=1');
    expect(mocks.apiOrNull).toHaveBeenCalledWith('/api/v1/marketplace/listings?limit=50');
    expect(html).toContain('&quot;walletVerified&quot;:true');
    expect(html).toContain('&quot;userBalanceWld&quot;:&quot;12345&quot;');
    expect(html).toContain('&quot;minPriceWld&quot;:&quot;1,250&quot;');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('fails closed on missing wallet and listing API instead of fabricating balances or market prices', async () => {
    mocks.apiOrNull.mockResolvedValue(null);
    const html = renderToStaticMarkup(await MarketplacePage());
    expect(html).toContain('&quot;walletVerified&quot;:false');
    expect(html).toContain('&quot;userBalanceWld&quot;:&quot;0&quot;');
    expect(html).toContain('&quot;askingSnapshot&quot;:null');
    expect(html).not.toContain('28500');
    expect(html).not.toContain('25000000');
  });
});
