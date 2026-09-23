'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';

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

export async function executeCraftingAction(recipeId: string): Promise<CraftingActionResult> {
  if (!recipeId) {
    return { status: 'error', message: '제작할 레시피가 지정되지 않았습니다.' };
  }

  try {
    const key = idempotencyKey();
    const result = await mutate<{
      success: boolean;
      item_code: string;
      name: string;
      category: string;
      rarity: string;
      fee_wld: number;
    }>('/api/v1/crafting/execute', {
      method: 'POST',
      body: {
        recipeId,
        idempotencyKey: key,
      },
    });

    revalidatePath('/marketplace');
    revalidatePath('/inventory');
    revalidatePath('/wallet');

    return {
      status: 'ok',
      message: `${result.name} 제작이 완료되었습니다! (수수료 ${result.fee_wld} WLD 소각)`,
      result,
    };
  } catch (error) {
    return failure(error, '재료가 부족하거나 제작 수수료 잔액이 부족하여 제작에 실패했습니다.');
  }
}
