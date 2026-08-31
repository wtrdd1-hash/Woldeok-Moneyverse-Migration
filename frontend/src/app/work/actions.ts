'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';

/**
 * Taking a task, submitting it, and being paid for it.
 *
 * Three writes rather than one, because the database keeps them apart:
 * `work_assign_task` (067) records that the member took the work,
 * `work_submit_completion` (067) refuses a submission made before the task's
 * `minimum_duration_seconds` have passed, and `work_verify_and_reward` (068)
 * mints the reward inside the same transaction that approves the assignment.
 * Collapsing them into one button would mean a member could not be told which
 * of the three refused them, and the minimum duration would have nothing to
 * measure.
 *
 * None of them sends an amount. The reward is computed by 068 from the
 * catalogue, the repeat decay and the two caps, inside the transaction that
 * posts it.
 */

function id(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === 'string' ? value.trim() : '';
}

export async function takeTask(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const taskId = id(formData, 'taskId');
  if (taskId === '') return { status: 'error', message: '작업을 확인할 수 없어요.' };

  try {
    const receipt = await mutate<{ replayed: boolean }>('/api/v1/work/assignments', {
      body: { taskId, idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/work');
    return {
      status: 'ok',
      message: receipt.replayed
        ? '이미 맡은 작업이에요. 아래 진행 중인 작업에서 확인해 주세요.'
        : '작업을 맡았어요. 최소 수행 시간이 지나면 제출할 수 있어요.',
    };
  } catch (error) {
    // 067 raises 23505 when the day's limit for this task is spent, which the
    // API answers as a conflict. That is the likeliest refusal by far, so it
    // is the sentence a conflict gets.
    return failure(error, '오늘 이 작업을 맡을 수 있는 횟수를 모두 채웠어요.');
  }
}

export async function submitTask(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const assignmentId = id(formData, 'assignmentId');
  if (assignmentId === '') return { status: 'error', message: '작업을 확인할 수 없어요.' };

  try {
    const receipt = await mutate<{ replayed: boolean }>(
      `/api/v1/work/assignments/${encodeURIComponent(assignmentId)}/completions`,
      { body: { idempotencyKey: idempotencyKey() } },
    );
    revalidatePath('/work');
    return {
      status: 'ok',
      message: receipt.replayed
        ? '이미 제출한 작업이에요.'
        : '작업을 제출했어요. 이제 보상을 받을 수 있어요.',
    };
  } catch (error) {
    return failure(error, '아직 제출할 수 없어요. 최소 수행 시간이 지났는지, 기한이 남았는지 확인해 주세요.');
  }
}

export async function claimReward(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const assignmentId = id(formData, 'assignmentId');
  if (assignmentId === '') return { status: 'error', message: '작업을 확인할 수 없어요.' };

  try {
    const receipt = await mutate<{
      reward_amount: string;
      experience_amount: string;
      replayed: boolean;
    }>(`/api/v1/work/assignments/${encodeURIComponent(assignmentId)}/verify`, {
      body: { idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/work');
    revalidatePath('/wallet');

    if (receipt.replayed) {
      return { status: 'ok', message: '이미 지급된 작업이에요. 영수증을 다시 확인했어요.' };
    }
    // Reported from the row the database returned, not from what the board
    // predicted. A reward clamped to zero by the caps still awards the
    // experience, and saying "0 WLD" without that would read as a failure.
    return {
      status: 'ok',
      message:
        receipt.reward_amount === '0'
          ? `보상 한도를 모두 채워 WLD는 지급되지 않았어요. 경험치 ${receipt.experience_amount}는 그대로 쌓였어요.`
          : `${receipt.reward_amount} WLD와 경험치 ${receipt.experience_amount}를 받았어요.`,
    };
  } catch (error) {
    return failure(error, '보상을 받지 못했어요. 제출한 작업인지 확인해 주세요.');
  }
}
