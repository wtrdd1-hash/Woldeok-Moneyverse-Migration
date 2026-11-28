'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/mutate';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';

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
 * Buys the Moneyverse Plus pass the catalogue returned. The id comes from the catalogue because
 * seeded catalogue ids differ between environments; a fixed id bought nothing where it was absent.
 */
export async function subscribePlusMembership(catalogId: string): Promise<PurchaseActionResult> {
  return buyCatalogItemDirect(catalogId, 1);
}

/**
 * Cancels auto-renewal of Moneyverse Plus VIP membership.
 */
export async function cancelPlusMembership(): Promise<PurchaseActionResult> {
  // W03 (2026-11-27): this used to answer success without calling any server. No cancellation
  // endpoint exists (a pass simply runs until it expires), so nothing is acknowledged.
  return {
    success: false,
    message: '지금은 구독 취소를 처리할 수 없어요. 보유 중인 패스는 유효기간이 끝나면 자동으로 만료됩니다.',
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
