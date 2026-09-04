'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';

function id(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === 'string' ? value.trim() : '';
}

export async function switchJobAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const jobType = id(formData, 'jobType');
  if (!jobType) return { status: 'error', message: '직업을 선택해 주세요.' };

  try {
    await mutate('/api/v1/work/active-job', {
      body: { jobType },
    });
    revalidatePath('/work');
    revalidatePath('/profile');
    return {
      status: 'ok',
      message: '활성 직업이 성공적으로 변경되었습니다. 해당 직업의 업무를 수행할 수 있습니다.',
    };
  } catch (error) {
    return failure(error, '직업 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.');
  }
}

export async function completeTaskV2Action(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const taskId = id(formData, 'taskId');
  if (!taskId) return { status: 'error', message: '작업 정보를 확인할 수 없습니다.' };

  try {
    const result = await mutate<{
      reward_amount: string;
      experience_gained: string;
      current_level: number;
      level_up: boolean;
    }>(`/api/v1/work/tasks/${encodeURIComponent(taskId)}/complete`, {
      body: { idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/work');
    revalidatePath('/wallet');
    revalidatePath('/profile');

    const levelMsg = result.level_up ? ` 🎉 축하합니다! 레벨 ${result.current_level}로 올랐습니다!` : '';
    return {
      status: 'ok',
      message: `업무를 완수했습니다! ${result.reward_amount} WLD 지급 + 숙련도 ${result.experience_gained} EXP 획득!${levelMsg}`,
    };
  } catch (error) {
    return failure(error, '업무 완료에 실패했습니다. 활성 직업과 일치하는 업무인지, 일일 수행 횟수가 남았는지 확인해 주세요.');
  }
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
