import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CatalogItem } from './catalog';

const mocks = vi.hoisted(() => ({ apiOrNull: vi.fn(), requireMember: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: mocks.apiOrNull }));
vi.mock('@/lib/session', () => ({ requireMember: mocks.requireMember }));
vi.mock('./catalog-forms', () => ({
  BuyForm: () => <button type="button">구입하기</button>,
  SettleUpkeepButton: () => <button type="button">관리비 내기</button>,
  UseItemButton: () => <button type="button">사용하기</button>,
}));

import ShopCatalogPage from './page';

const bicycle: CatalogItem = {
  catalog_id: '11111111-1111-4111-8111-111111111111',
  code: 'used_bicycle',
  name: '중고 자전거',
  description: '배달 작업용 이동수단입니다.',
  category: 'vehicle',
  price: '5000',
  quantity: null,
  purchase_limit: 'account_one',
  effect_kind: 'convenience',
  maintenance_cost: '100',
  sale_ends_at: null,
};

beforeEach(() => {
  mocks.requireMember.mockResolvedValue({ userId: 'member' });
  mocks.apiOrNull.mockImplementation(async (path: string) => {
    if (path === '/api/v1/shop/catalog') return { catalogItems: [bicycle] };
    if (path === '/api/v1/shop/holdings') return null;
    return { event: null };
  });
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('shop catalogue holding read availability', () => {
  it('does not offer a purchase when existing holdings cannot be verified', async () => {
    render(await ShopCatalogPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText('중고 자전거')).toBeDefined();
    expect(screen.queryByRole('button', { name: '구입하기' })).toBeNull();
    expect(screen.getByRole('alert').textContent).toContain('보유');
    expect(screen.getByRole('link', { name: /다시 확인/ }).getAttribute('href')).toBe('/shop/catalog');
  });

  it('preserves a filtered search on retry without rendering a purchase action', async () => {
    render(await ShopCatalogPage({ searchParams: Promise.resolve({ q: '자전거 & 도구' }) }));
    expect(screen.getByRole('link', { name: /다시 확인/ }).getAttribute('href')).toBe(
      '/shop/catalog?q=%EC%9E%90%EC%A0%84%EA%B1%B0%20%26%20%EB%8F%84%EA%B5%AC',
    );
    expect(screen.queryByRole('button', { name: '구입하기' })).toBeNull();
  });

  it('offers purchase after the server confirms that the shelf is empty', async () => {
    mocks.apiOrNull.mockImplementation(async (path: string) => {
      if (path === '/api/v1/shop/catalog') return { catalogItems: [bicycle] };
      if (path === '/api/v1/shop/holdings') return { holdings: [] };
      return { event: null };
    });
    render(await ShopCatalogPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole('button', { name: '구입하기' })).toBeDefined();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
