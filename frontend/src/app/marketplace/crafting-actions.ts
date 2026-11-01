'use server';

import type { ActionState } from '@/lib/action-state';

export interface CraftingActionResult extends ActionState {
  readonly result?: {
    readonly success: boolean;
    readonly item_code: string;
    readonly name: string;
    readonly category: string;
    readonly rarity: string;
    readonly fee_wld: number;
  } | null;
}

/** No crafting write is safe until a canonical ledger receipt and idempotency source exist. */
export async function executeCraftingAction(_recipeId: string): Promise<CraftingActionResult> {
  return {
    status: 'error',
    message: '원장 정산 및 제작 결과가 검증되지 않아 제작 기능을 이용할 수 없습니다. 제작 요청을 전송하지 않았습니다.',
  };
}
