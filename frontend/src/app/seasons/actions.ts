'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, idempotencyKey, mutate, wholeAmount } from '@/lib/mutate';
import { groupDigits } from '@/lib/money';

/**
 * Enters a season event.
 *
 * The entry fee is charged and the points are awarded by one database
 * function, in one transaction — which is why the page sends only how many
 * entries, and the receipt reports the points that were actually recorded.
 */
export async function enterEvent(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const eventId = String(formData.get('eventId') ?? '');
  const quantity = wholeAmount(formData.get('quantity')) ?? 1;

  if (eventId === '') return { status: 'error', message: '참가할 이벤트를 확인할 수 없어요.' };

  try {
    const receipt = await mutate<{ pointsEarned: string; replayed: boolean }>(
      `/api/v1/seasons/events/${encodeURIComponent(eventId)}/consumptions`,
      { body: { quantity, idempotencyKey: idempotencyKey() } },
    );
    revalidatePath('/seasons');
    return {
      status: 'ok',
      message: receipt.replayed
        ? '이미 처리된 참가 기록을 다시 확인했어요.'
        : `${groupDigits(receipt.pointsEarned)}점을 획득했어요.`,
    };
  } catch (error) {
    return failure(error, '지금은 참가를 처리할 수 없어요.');
  }
}

export async function claimSeasonRewardAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const seasonId = String(formData.get('seasonId') ?? '').trim();
  if (!seasonId) {
    return { status: 'error', message: '수령할 시즌 식별자가 올바르지 않습니다.' };
  }

  try {
    const result = await mutate<{
      claimId: string;
      seasonId: string;
      seasonName: string;
      tier: string;
      rank: number | null;
      rewardWld: number;
      trophyCode: string | null;
      claimedAt: unknown;
    }>('/api/v1/seasons/claim-rewards', {
      body: {
        seasonId,
        idempotencyKey: idempotencyKey(),
      },
    });

    revalidatePath('/seasons');
    revalidatePath('/wallet');

    const rankText = result.rank ? `${result.rank}위 (${result.tier})` : result.tier;
    return {
      status: 'ok',
      message: `${result.seasonName} ${rankText} 시즌 보상 ${groupDigits(result.rewardWld)} WLD와 명예 트로피를 성공적으로 수령했습니다!`,
    };
  } catch (error) {
    return failure(error, '시즌 보상 수령에 실패했습니다. 이미 수령했거나 수령 대상이 아닐 수 있습니다.');
  }
}
