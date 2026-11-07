import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ requireMember: vi.fn(), apiOrNull: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireMember: mocks.requireMember }));
vi.mock('@/lib/api', () => ({ apiOrNull: mocks.apiOrNull }));
vi.mock('@/components/page-header', () => ({ PageHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock('./catalog-forms', () => ({ BuyForm: () => null, SettleUpkeepButton: () => null, UseItemButton: () => null }));
vi.mock('./catalog-parts', () => ({ CatalogCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, HoldingCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
import ShopCatalogPage from './page';

beforeEach(() => {
  vi.resetAllMocks();
  mocks.requireMember.mockResolvedValue(undefined);
  mocks.apiOrNull.mockImplementation(async (path: string) => path.includes('/shop/catalog') ? { catalogItems: [] } : path.includes('/shop/holdings') ? { holdings: [] } : { event: null });
});

describe('member stock availability control', () => {
  it('sends the owner-scoped stock selector and renders a keyboard accessible control', async () => {
    const html = renderToStaticMarkup(await ShopCatalogPage({ searchParams: Promise.resolve({ stock: 'available', q: 'hat' }) }));
    expect(mocks.apiOrNull).toHaveBeenCalledWith('/api/v1/shop/catalog?stock=available');
    expect(html).toContain('name="stock"');
    expect(html).toContain('value="available"');
    expect(html).toContain('재고 있는');
  });
  it('does not show a stale backend sold-out item as available on HTTP 200', async () => {
    mocks.apiOrNull.mockImplementation(async (path: string) => path.includes('/shop/catalog')
      ? { catalogItems: [{ catalog_id: '11111111-1111-4111-8111-111111111111', code: 'sold', name: 'Sold item', description: 'none', category: 'general', price: '1', quantity: 0, purchase_limit: 'unlimited', effect_kind: 'decoration', maintenance_cost: '0', sale_ends_at: null }] }
      : path.includes('/shop/holdings') ? { holdings: [] } : { event: null });
    const html = renderToStaticMarkup(await ShopCatalogPage({ searchParams: Promise.resolve({ stock: 'available' }) }));
    expect(html).toContain('상점 목록을 불러오지 못했어요.');
    expect(html).not.toContain('Sold item');
  });
  it('does not forward unknown stock selectors to the API', async () => {
    await ShopCatalogPage({ searchParams: Promise.resolve({ stock: 'sold_out' }) });
    expect(mocks.apiOrNull).toHaveBeenCalledWith('/api/v1/shop/catalog');
  });
});
