'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, mutate } from '@/lib/mutate';

export async function saveWorkFavoriteAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const taskId = formData.get('taskId');
  const savedInput = formData.get('saved');
  if (typeof taskId !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(taskId) ||
      (savedInput !== 'true' && savedInput !== 'false')) {
    return { status: 'error', message: '저장할 업무를 확인할 수 없어요.' };
  }
  const saved = savedInput === 'true';
  try {
    const receipt = await mutate<{ saved: boolean; replayed: boolean }>(
      `/api/v1/work/favorites/${encodeURIComponent(taskId)}`,
      { body: { saved } },
    );
    if (receipt.saved !== saved) {
      return { status: 'error', message: '업무 저장 상태를 확인하지 못했어요.' };
    }
    revalidatePath('/work');
    return { status: 'ok', message: saved ? '업무를 저장했어요.' : '저장한 업무를 제거했어요.' };
  } catch (error) {
    return failure(error, '업무 저장 상태를 변경하지 못했어요. 다시 시도해 주세요.');
  }
}
