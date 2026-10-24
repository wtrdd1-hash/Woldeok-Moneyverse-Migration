import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminShopView, type AdminShopItem } from './admin-shop-view';

const product: AdminShopItem = {
  id: '22222222-2222-4222-8222-222222222222',
  code: 'TEST_ITEM',
  name: '검증 상품',
  description: 'fixture',
  category: 'general',
  base_price: '100',
  rarity: 'common',
  max_stock: 20,
  current_stock: 8,
  is_limited: true,
  active: true,
  purchase_limit: '1',
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('admin shop stock authority HOLD', () => {
  it('shows non-authoritative catalog stock as read-only on mobile and desktop', () => {
    render(<AdminShopView items={[product]} />);
    fireEvent.click(screen.getAllByRole('button', { name: '아이템 설정 수정' })[0]!);
    expect(screen.queryAllByRole('spinbutton')).toHaveLength(0);
    expect(screen.getAllByText(/재고.*(보류|참고)/).length).toBeGreaterThan(0);
  });

  it('never submits stock in a price/status PATCH and keeps catalog stock unchanged', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    render(<AdminShopView items={[product]} />);
    fireEvent.click(screen.getAllByRole('button', { name: '아이템 설정 수정' })[0]!);
    fireEvent.click(screen.getByRole('button', { name: '저장 완료' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/admin/shop/items/');
    const body = JSON.parse(String(options.body));
    expect(body).toEqual({ base_price: '100', active: true });
    expect(Object.hasOwn(body, 'current_stock')).toBe(false);
  });
});
