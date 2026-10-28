'use server';

import type { ActionState } from '@/lib/action-state';
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

  // A browser action must not claim a payout without verified eligibility
  // and an atomic, immutable ledger receipt.
  return {
    status: 'error',
    message: '일일 퀘스트 WLD 보상 정산은 검증 완료 전까지 중단되어 있습니다.',
  };
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
