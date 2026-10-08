'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';
import { apiOrNull } from '@/lib/api';

export interface DailyQuestClaimResult {
  readonly success: boolean;
  readonly questId: string;
  readonly rewardAmount: number;
  readonly newBalance: string;
  readonly transactionId: string;
  readonly claimedAt: string;
}

export interface DailyQuestStatusResult {
  readonly claimedQuests: Record<string, boolean>;
  readonly allClearClaimed: boolean;
  readonly totalEarnedToday: number;
}

export async function claimDailyQuestAction(
  questId: string,
): Promise<ActionState & { readonly result?: DailyQuestClaimResult }> {
  if (!questId) {
    return { status: 'error', message: '퀘스트 식별자가 지정되지 않았습니다.' };
  }

  try {
    const key = idempotencyKey();
    const result = await mutate<DailyQuestClaimResult>(
      '/app-api/v1/engagement/dopamine/daily-quest/claim',
      {
        method: 'POST',
        body: {
          questId,
          idempotencyKey: key,
        },
      },
    );

    revalidatePath('/');
    revalidatePath('/wallet');

    return {
      status: 'ok',
      message: `${result.rewardAmount.toLocaleString()} WLD 퀘스트 보상이 지갑으로 정산되었습니다!`,
      result,
    };
  } catch (error) {
    return failure(error, '퀘스트 보상 수령 처리에 실패했습니다. 오늘 이미 수령했거나 조건을 확인해 주세요.');
  }
}

export async function fetchDailyQuestStatusAction(): Promise<DailyQuestStatusResult | null> {
  try {
    return await apiOrNull<DailyQuestStatusResult>(
      '/app-api/v1/engagement/dopamine/daily-quest/status',
    );
  } catch {
    return null;
  }
}
