'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';
import { failure, mutate } from '@/lib/mutate';
import type { ActionState } from '@/lib/action-state';
import type { AdminShopItem } from './admin-shop-view';
import { parseShopCatalog, validShopPrice, validShopStock } from './shop-evidence';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ShopUpdateInput {
  readonly id: string;
  readonly basePrice: string;
  readonly active: boolean;
  readonly currentStock: number | null;
}

export interface ShopUpdateResult extends ActionState {
  readonly item?: AdminShopItem;
}

/** The browser cannot mint a one-use CSRF token. Mutate on the server and confirm the authoritative read. */
export async function updateShopItem(input: ShopUpdateInput): Promise<ShopUpdateResult> {
  if (!input || typeof input.id !== 'string' || !UUID.test(input.id) ||
    !validShopPrice(input.basePrice) || typeof input.active !== 'boolean' ||
    !validShopStock(input.currentStock)) {
    return { status: 'error', message: '가격은 양의 정수 WLD, 재고는 0 이상의 정수 또는 무제한으로 입력해 주세요.' };
  }

  try {
    const result = await mutate<{ item: { id: string; base_price: string; active: boolean } }>(
      `/api/v1/admin/shop/items/${encodeURIComponent(input.id)}`,
      { method: 'PATCH', body: { base_price: input.basePrice, active: input.active, current_stock: input.currentStock } },
    );
    if (result?.item?.id !== input.id || result.item.base_price !== input.basePrice ||
      result.item.active !== input.active) {
      return { status: 'error', message: '서버 변경 결과가 일치하지 않습니다. 다시 조회해 주세요.' };
    }
    const catalog = parseShopCatalog(await api<unknown>('/api/v1/admin/shop/items'));
    const item = catalog?.find((candidate) => candidate.id === input.id);
    if (!item || item.base_price !== input.basePrice || item.active !== input.active ||
      item.current_stock !== input.currentStock) {
      return { status: 'error', message: '변경 후 서버 상태를 확인하지 못했습니다. 새로고침 후 확인해 주세요.' };
    }
    revalidatePath('/admin/shop');
    return { status: 'ok', message: '서버에서 변경된 상품 상태를 확인했습니다.', item };
  } catch (error) {
    return failure(error, '상품 설정을 변경하지 못했습니다.');
  }
}
