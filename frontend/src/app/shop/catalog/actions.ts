'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, idempotencyKey, mutate, wholeNumber } from '@/lib/mutate';
import {
  PURCHASE_CEILING,
  purchaseMessage,
  settlementMessage,
  useMessage as formatUseMessage,
} from './catalog';
import type { PurchaseReceipt, SettlementReceipt, UseReceipt } from './catalog';

/**
 * The catalogue's two writes.
 *
 * Neither sends a price. `shop_purchase_catalog` re-reads `base_price` inside
 * the same transaction that posts the ledger entry and charges the sink, so a
 * stale card or an edited request cannot decide what a member pays -- and a
 * replay reports the amount stored on the first receipt rather than anything
 * this caller repeats.
 *
 * The idempotency key is minted on the server, once per submission. A repeat
 * carrying the same key returns the first receipt instead of charging twice,
 * and the receipt says which of the two happened.
 */

/**
 * The shape 072 and the DTO both accept for the catalogue id.
 *
 * Deliberately the pattern `requireShopUuid` uses rather than the RFC-strict
 * one: this is a shape check on a value that came off the page, not a second
 * opinion about which items exist. That answer belongs to the database, and
 * an unknown-but-well-formed id still goes and is answered with a conflict.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Buys one line of the catalogue.
 *
 * The count is validated against the ceiling the member can see on the field
 * itself. Everything else -- the balance, the stock, whether the purchase
 * limit is already spent -- is the database's to refuse, and refusing it here
 * from a page that may be a minute old would be guessing.
 */
export async function buyCatalogItem(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const catalogId = String(formData.get('catalogId') ?? '');
  if (!UUID.test(catalogId)) {
    return { status: 'error', message: '구입할 아이템을 확인할 수 없어요.' };
  }

  // An absent field is one item, which is what a card with no count control
  // means. A field that was filled in with something that is not a whole
  // count is a mistake worth naming rather than quietly rounding to one.
  const raw = formData.get('quantity');
  const quantity = raw === null || raw === '' ? 1 : wholeNumber(raw);
  if (quantity === null || quantity > PURCHASE_CEILING) {
    return {
      status: 'error',
      message: `구매 수량은 1개부터 ${PURCHASE_CEILING}개까지 정수로 입력해 주세요.`,
    };
  }

  try {
    const receipt = await mutate<PurchaseReceipt>(
      `/api/v1/shop/catalog/${encodeURIComponent(catalogId)}/purchases`,
      { body: { idempotencyKey: idempotencyKey(), quantity } },
    );
    revalidatePath('/shop/catalog');
    return { status: 'ok', message: purchaseMessage(receipt) };
  } catch (error) {
    // A missing item, an inactive one, a closed sale window, an empty shelf,
    // a spent purchase limit and an insufficient balance all arrive as one
    // 409. They are one fact to a member -- this cannot be bought right now
    // -- and the sentence says the two they can act on.
    return failure(
      error,
      '지금은 이 아이템을 구입할 수 없어요. 잔액이 모자라거나 구매 한도를 이미 채웠을 수 있어요.',
    );
  }
}

/**
 * Consumes one held item.
 *
 * No count: `shop_use_item` spends exactly one per call, and a form offering
 * a number would be promising something the function cannot do.
 */
export async function consumeHeldItem(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const catalogId = String(formData.get('catalogId') ?? '');
  if (!UUID.test(catalogId)) {
    return { status: 'error', message: '사용할 아이템을 확인할 수 없어요.' };
  }

  try {
    const receipt = await mutate<UseReceipt>(
      `/api/v1/shop/holdings/${encodeURIComponent(catalogId)}/consumptions`,
      { body: { idempotencyKey: idempotencyKey() } },
    );
    revalidatePath('/shop/catalog');
    return { status: 'ok', message: formatUseMessage(receipt) };
  } catch (error) {
    return failure(
      error,
      '지금은 이 아이템을 사용할 수 없어요. 남은 수량이 없거나 사용할 수 없는 아이템일 수 있어요.',
    );
  }
}

/**
 * Pays the outstanding weekly upkeep on one holding.
 *
 * No amount is sent, for the same reason no price is: `shop_settle_upkeep`
 * reads the capped `amount_due` inside the transaction that charges it, and
 * this card may have been rendered before the Monday run that changed the
 * figure. The card shows the amount; the database decides it.
 */
export async function settleItemUpkeep(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const catalogId = String(formData.get('catalogId') ?? '');
  if (!UUID.test(catalogId)) {
    return { status: 'error', message: '관리비를 낼 아이템을 확인할 수 없어요.' };
  }

  try {
    const receipt = await mutate<SettlementReceipt>(
      `/api/v1/shop/holdings/${encodeURIComponent(catalogId)}/upkeep-settlements`,
      { body: { idempotencyKey: idempotencyKey() } },
    );
    revalidatePath('/shop/catalog');
    return { status: 'ok', message: settlementMessage(receipt) };
  } catch (error) {
    // Nothing outstanding and too little cash both arrive as one 409. The
    // second is the one a member can act on, so it is the one named.
    return failure(error, '지금은 관리비를 낼 수 없어요. 잔액이 모자랄 수 있어요.');
  }
}
