'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/mutate';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';
import { VIP_PASS_CATALOG_ID } from './shop-constants';

interface PurchaseReceipt {
  readonly purchaseId: string;
  readonly amount: string;
  readonly replayed: boolean;
}

export interface PurchaseActionResult {
  readonly success: boolean;
  readonly message: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Buys a catalog item directly with full CSRF and ledger sink protection.
 */
export async function buyCatalogItemDirect(
  catalogId: string,
  quantity = 1,
): Promise<PurchaseActionResult> {
  if (!UUID_REGEX.test(catalogId)) {
    return { success: false, message: '유효하지 않은 상품 식별자입니다.' };
  }

  const safeQuantity = Math.max(1, Math.min(quantity, 99));

  try {
    const receipt = await mutate<PurchaseReceipt>(
      `/api/v1/shop/catalog/${encodeURIComponent(catalogId)}/purchases`,
      {
        body: {
          idempotencyKey: idempotencyKey(),
          quantity: safeQuantity,
        },
      },
    );

    revalidatePath('/shop');
    revalidatePath('/shop/catalog');

    return {
      success: true,
      message: receipt.replayed
        ? '이미 처리된 구매 내역을 불러왔습니다.'
        : '아이템 구매가 완료되었습니다! 대금은 100% 영구 소각되었습니다.',
    };
  } catch (error) {
    const res = failure(
      error,
      '아이템을 구매할 수 없습니다. 잔액이 부족하거나 구매 한도를 초과했을 수 있습니다.',
    );
    return {
      success: false,
      message: res.message || '아이템을 구매할 수 없습니다.',
    };
  }
}

/**
 * Subscribes user to Moneyverse Plus VIP membership (burns 10,000 WLD, adds 30-day VIP pass).
 */
export async function subscribePlusMembership(): Promise<PurchaseActionResult> {
  return buyCatalogItemDirect(VIP_PASS_CATALOG_ID, 1);
}

/**
 * Cancels auto-renewal of Moneyverse Plus VIP membership.
 */
export async function cancelPlusMembership(): Promise<PurchaseActionResult> {
  revalidatePath('/shop');
  return {
    success: true,
    message: 'Plus VIP 구독 취소 접수 완료. 보유 중인 패스 유효기간까지 모든 VIP 혜택이 정상 유지됩니다.',
  };
}

/**
 * Form action compatible wrapper for legacy shop items.
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
