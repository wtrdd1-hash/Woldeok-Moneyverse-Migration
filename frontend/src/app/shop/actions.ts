'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/mutate';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';

interface PurchaseReceipt {
  readonly purchaseId: string;
  readonly amount: string;
  readonly replayed: boolean;
}

/**
 * Buys one catalogue item.
 *
 * The price is never sent. The database function re-reads the listed price
 * inside the same transaction that posts the ledger entry, so a stale page or
 * an edited request cannot decide what a member pays — the original made the
 * same choice and the screen says so out loud.
 *
 * The idempotency key is minted per submission. A repeat carrying the same
 * key returns the first receipt instead of charging twice, and the receipt
 * says which happened.
 */
export async function purchaseItem(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const itemId = formData.get('itemId');
  if (typeof itemId !== 'string' || itemId === '') {
    return { status: 'error', message: '구매할 상품을 확인할 수 없어요.' };
  }

  try {
    const receipt = await mutate<PurchaseReceipt>(
      `/api/v1/shop/items/${encodeURIComponent(itemId)}/purchases`,
      { body: { idempotencyKey: idempotencyKey() } },
    );
    revalidatePath('/shop');
    return {
      status: 'ok',
      message: receipt.replayed
        ? '이미 처리된 구매 기록을 다시 확인했어요.'
        : '결제를 기록했어요. 지갑 원장에서도 확인할 수 있어요.',
    };
  } catch (error) {
    return failure(error, '지금은 구매를 처리할 수 없어요.');
  }
}
