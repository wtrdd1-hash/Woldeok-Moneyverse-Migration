import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { ShopComparePanel } from './shop-compare-panel';

const a = '11111111-1111-4111-8111-111111111111';
const b = '22222222-2222-4222-8222-222222222222';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('member shop cost comparison', () => {
  it('shows only a selection prompt until exactly two items are chosen', () => {
    const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock);
    render(<ShopComparePanel selectedIds={[a]} />);
    expect(screen.getByText(/2개 상품을 선택/)).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('uses the server read model, no-store, and exact bigint strings', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({
      source: 'shop_catalog_list_v2', cheaperCatalogId: a, priceDifference: '1', weeklyUpkeepDifference: '3',
      items: [{ catalog_id: a, name: '첫 상품', price: '9007199254740993000', maintenance_cost: '4' },
        { catalog_id: b, name: '둘째 상품', price: '9007199254740993001', maintenance_cost: '1' }],
    }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<ShopComparePanel selectedIds={[a, b]} />);
    await waitFor(() => expect(screen.getByText('첫 상품')).toBeTruthy());
    expect(screen.getByText(/9,007,199,254,740,993,000/)).toBeTruthy();
    expect(screen.getByText(/더 저렴한 상품: 첫 상품/)).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(`/app-api/v1/shop/compare?ids=${a}%2C${b}`, expect.objectContaining({ cache: 'no-store' }));
  });
  it('refuses contradictory server difference receipts', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({
      source: 'shop_catalog_list_v2', cheaperCatalogId: a, priceDifference: '999', weeklyUpkeepDifference: '0',
      items: [{ catalog_id: a, name: 'A', price: '1', maintenance_cost: '0' },
        { catalog_id: b, name: 'B', price: '2', maintenance_cost: '0' }],
    }) }));
    render(<ShopComparePanel selectedIds={[a, b]} />);
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.queryByText('A')).toBeNull();
  });

  it('fails closed rather than showing fake prices when the API refuses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    render(<ShopComparePanel selectedIds={[a, b]} />);
    await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/비교 정보를 확인할 수 없습니다/));
    expect(screen.queryByText(/0 WLD/)).toBeNull();
  });
});
