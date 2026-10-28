import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  apiOrNull: vi.fn(),
  publicApi: vi.fn(),
  isLoggedInMember: vi.fn(),
}));

vi.mock('@/lib/api', () => ({ apiOrNull: mocks.apiOrNull, publicApi: mocks.publicApi }));
vi.mock('@/lib/session', () => ({ isLoggedInMember: mocks.isLoggedInMember }));
vi.mock('@/components/page-header', () => ({
  PageHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Accent: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));
vi.mock('@/components/translated-text', () => ({
  TranslatedText: ({ korean }: { korean: string }) => <span>{korean}</span>,
}));
vi.mock('./shop-store-view', () => ({
  ShopStoreView: ({ items }: { items: unknown[] }) => <div data-items={items.length}>Store</div>,
}));
vi.mock('./shop-membership-section', () => ({
  ShopMembershipSection: ({ isPlusMember }: { isPlusMember: boolean }) => (
    <div data-vip={String(isPlusMember)}>Membership</div>
  ),
}));

import ShopPage from './page';

beforeEach(() => {
  vi.resetAllMocks();
  mocks.isLoggedInMember.mockResolvedValue(true);
  mocks.apiOrNull.mockImplementation(async (path: string) => {
    if (path === '/api/v1/shop/catalog') {
      return { catalogItems: [{ code: 'item_vip_lounge_pass', user_owned_quantity: 1 }] };
    }
    if (path.startsWith('/api/v1/shop/catalog?')) {
      return { catalogItems: [{ code: 'hat', maintenance_cost: '0' }] };
    }
    return null;
  });
});

describe('shop upkeep ceiling server-rendered flow', () => {
  it('sends combined text/upkeep filter to member API while retaining VIP from unfiltered catalogue', async () => {
    const html = renderToStaticMarkup(
      await ShopPage({ searchParams: Promise.resolve({ q: 'hat', maxUpkeep: '0' }) }),
    );
    expect(mocks.apiOrNull).toHaveBeenCalledWith('/api/v1/shop/catalog?q=hat&maxUpkeep=0');
    expect(mocks.apiOrNull).toHaveBeenCalledWith('/api/v1/shop/catalog');
    expect(html).toContain('name="maxUpkeep"');
    expect(html).toContain('value="0"');
    expect(html).toContain('data-vip="true"');
    expect(html).toContain('data-items="1"');
  });
  it('reports malformed query and avoids the catalogue fetch instead of claiming zero matching products', async () => {
    mocks.isLoggedInMember.mockResolvedValue(false);
    const html = renderToStaticMarkup(
      await ShopPage({ searchParams: Promise.resolve({ maxUpkeep: '-100' }) }),
    );
    expect(mocks.publicApi).not.toHaveBeenCalled();
    expect(html).toContain('role="alert"');
    expect(html).toContain('aria-invalid="true"');
  });
});
