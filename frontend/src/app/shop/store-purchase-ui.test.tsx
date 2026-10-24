// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';

const { buyMock, refreshMock } = vi.hoisted(() => ({ buyMock: vi.fn(), refreshMock: vi.fn() }));
vi.mock('./store-actions', () => ({ buyStoreItem: buyMock }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: refreshMock }) }));
vi.mock('@/components/profile-cosmetics', () => ({
  AvatarWithCosmetics: () => null,
  NameplateWithTitle: () => null,
}));
vi.mock('@/components/fiat-amount', () => ({ FiatBadge: () => null }));

import { ShopStoreView, type CatalogItem } from './shop-store-view';

const ITEM: CatalogItem = {
  catalog_id: '11111111-1111-4111-8111-111111111111',
  code: 'test_item', name: 'Test item', description: 'Test description', category: 'badge',
  price: '100', quantity: null, purchase_limit: 'unlimited', effect_kind: 'decoration',
  maintenance_cost: '0', sale_ends_at: null, rarity: 'common', animation_css: null,
  preview_data: {}, max_stock: null, is_limited: false,
  user_owned_quantity: 0, user_is_equipped: false,
};

beforeEach(() => {
  cleanup();
  buyMock.mockReset();
  refreshMock.mockReset();
  vi.stubGlobal('crypto', { randomUUID: () => '22222222-2222-4222-8222-222222222222' });
});

describe('store purchase browser interaction', () => {
  it('offers login rather than a non-functional purchase to guests', () => {
    render(<ShopStoreView items={[ITEM]} userBalance="0" signedIn={false} />);
    expect(screen.getByRole('link', { name: '로그인 후 구매' }).getAttribute('href')).toBe('/login');
    expect(screen.queryByRole('button', { name: '구매' })).toBeNull();
  });

  it('keeps the same idempotency key on an uncertain response and announces verified success', async () => {
    buyMock.mockResolvedValueOnce({ status: 'error', message: 'Connection lost' });
    buyMock.mockResolvedValueOnce({ status: 'ok', message: '100 WLD를 결제했어요.' });
    render(<ShopStoreView items={[ITEM]} userBalance="200" signedIn />);
    fireEvent.click(screen.getByRole('button', { name: '구매' }));
    expect(screen.getByRole('dialog', { name: '아이템 구매 확인' }).getAttribute('aria-modal')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: '확인 및 결제' }));
    await screen.findByRole('button', { name: '같은 요청 재확인' });
    expect(screen.getByRole('status').textContent).toContain('Connection lost');
    fireEvent.click(screen.getByRole('button', { name: '같은 요청 재확인' }));
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('100 WLD'));
    expect(buyMock).toHaveBeenCalledTimes(2);
    expect(buyMock.mock.calls[0]).toEqual(buyMock.mock.calls[1]);
    expect(refreshMock).toHaveBeenCalledOnce();
  });
});
