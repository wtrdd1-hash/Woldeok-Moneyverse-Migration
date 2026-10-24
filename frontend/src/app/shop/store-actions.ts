'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, mutate } from '@/lib/mutate';
import { PURCHASE_CEILING, purchaseMessage, type PurchaseReceipt } from './catalog/catalog';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The browser retains one UUID for an intent; only the database decides whether it charged. */
export async function buyStoreItem(
  catalogId: string,
  quantity: number,
  requestKey: string,
): Promise<ActionState> {
  if (!UUID.test(catalogId) || !UUID.test(requestKey) || !Number.isInteger(quantity) || quantity < 1 || quantity > PURCHASE_CEILING) {
    return { status: 'error', message: '상품과 구매 수량을 다시 확인해 주세요.' };
  }

  try {
    const receipt = await mutate<PurchaseReceipt>(
      `/api/v1/shop/catalog/${encodeURIComponent(catalogId)}/purchases`,
      { body: { idempotencyKey: requestKey, quantity } },
    );
    if (
      !receipt ||
      !UUID.test(receipt.purchase_id) ||
      !UUID.test(receipt.transaction_id) ||
      !/^[1-9][0-9]*$/.test(receipt.amount) ||
      typeof receipt.replayed !== 'boolean'
    ) {
      throw new Error('Shop API returned no verified purchase receipt');
    }
    revalidatePath('/shop');
    revalidatePath('/shop/catalog');
    revalidatePath('/wallet');
    return { status: 'ok', message: purchaseMessage(receipt) };
  } catch (error) {
    return failure(error, '구매 상태를 확인하지 못했어요. 같은 요청으로 재시도하거나 지갑 거래 내역을 확인해 주세요.');
  }
}
