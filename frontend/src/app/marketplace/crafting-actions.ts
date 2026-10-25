'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { api } from '@/lib/api';
import { canonicalIntegerString } from '@/lib/money';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';
import { P0_CRAFTING_RECIPES } from './crafting-recipes';
import type { MarketplaceHolding } from './marketplace';

export interface CraftingSnapshot {
  readonly holdings: readonly MarketplaceHolding[];
  readonly cashBalanceWld: string;
}

export interface CraftingActionResult extends ActionState {
  readonly result?: {
    readonly success: true;
    readonly item_code: string;
    readonly name: string;
    readonly fee_wld: number | string;
  };
  readonly snapshot?: CraftingSnapshot;
  /** The write may have committed; do not encourage a second debit. */
  readonly settlementUnknown?: boolean;
}

const UNCERTAIN_NOTICE =
  '제작 결과를 확인할 수 없습니다. 재요청하기 전에 페이지를 새로고침하고 인벤토리와 지갑 내역을 확인해 주세요.';

function isHolding(value: unknown): value is MarketplaceHolding {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<MarketplaceHolding>;
  return typeof item.catalog_id === 'string' && item.catalog_id.length > 0
    && typeof item.code === 'string' && item.code.length > 0
    && typeof item.name === 'string' && typeof item.description === 'string'
    && typeof item.category === 'string' && typeof item.rarity === 'string'
    && typeof item.effect_kind === 'string' && typeof item.acquired_at === 'string'
    && typeof item.is_equipped === 'boolean'
    && Number.isSafeInteger(item.quantity) && (item.quantity ?? -1) >= 0
    && (item.serial_number === null || Number.isSafeInteger(item.serial_number));
}

export async function executeCraftingAction(recipeId: string): Promise<CraftingActionResult> {
  const recipe = P0_CRAFTING_RECIPES.find((candidate) => candidate.id === recipeId);
  if (!recipe) return { status: 'error', message: '확인되지 않은 제작 레시피입니다.' };

  let attempted = false;
  try {
    const key = idempotencyKey();
    attempted = true;
    const response: unknown = await mutate('/api/v1/crafting/execute', {
      method: 'POST',
      body: { recipeId, idempotencyKey: key },
    });
    if (!response || typeof response !== 'object') {
      return { status: 'error', message: UNCERTAIN_NOTICE, settlementUnknown: true };
    }
    const receipt = response as Record<string, unknown>;
    if (receipt.success !== true
      || receipt.item_code !== recipe.resultItem.code
      || canonicalIntegerString(receipt.fee_wld) !== recipe.feeWld
      || typeof receipt.name !== 'string' || !receipt.name.trim()) {
      return { status: 'error', message: UNCERTAIN_NOTICE, settlementUnknown: true };
    }

    const [holdingsResponse, walletResponse] = await Promise.all([
      api<{ holdings?: unknown }>('/api/v1/shop/holdings'),
      api<{ balances?: { cash?: { availableAmount?: unknown } } }>('/api/v1/wallet'),
    ]);
    const holdings = holdingsResponse?.holdings;
    const cashBalanceWld = canonicalIntegerString(walletResponse?.balances?.cash?.availableAmount);
    if (!Array.isArray(holdings) || !holdings.every(isHolding)
      || !holdings.some((item: MarketplaceHolding) => item.code === recipe.resultItem.code && item.quantity > 0)
      || cashBalanceWld === null || cashBalanceWld.startsWith('-')) {
      return { status: 'error', message: UNCERTAIN_NOTICE, settlementUnknown: true };
    }

    revalidatePath('/marketplace');
    revalidatePath('/inventory');
    revalidatePath('/wallet');
    return {
      status: 'ok',
      message: `${receipt.name} 제작이 확인되었습니다.`,
      result: {
        success: true,
        item_code: recipe.resultItem.code,
        name: receipt.name,
        fee_wld: receipt.fee_wld as string | number,
      },
      snapshot: { holdings, cashBalanceWld },
    };
  } catch (error) {
    const refused = failure(error, '제작 요청에 실패했습니다.');
    return {
      status: 'error',
      message: attempted ? `${refused.message ?? '요청 실패'} ${UNCERTAIN_NOTICE}` : (refused.message ?? '제작 요청에 실패했습니다.'),
      ...(attempted ? { settlementUnknown: true } : {}),
    };
  }
}
