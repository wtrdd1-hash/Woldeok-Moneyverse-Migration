'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { ApiError } from '@/lib/api';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';
import { STEP_UP_CODE, spendSecondFactorCode } from '../step-up';

const PAGE = '/admin/work';
const CODE_REQUIRED = { status: 'error', message: '실행 직전 인증 코드 6자리를 입력해 주세요.' } as const;

function text(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function explain(error: unknown, fallback: string): ActionState {
  if (error instanceof ApiError) {
    if (error.code === 'admin_work_policy_failed') {
      return { status: 'error', message: '직업 보상 정책 변경에 실패했습니다. 입력값을 확인해 주세요.' };
    }
    if (error.code === 'admin_work_task_failed') {
      return { status: 'error', message: '작업 카탈로그 항목 갱신에 실패했습니다.' };
    }
  }
  return failure(error, fallback);
}

/**
 * 전역 직업 보상 정책(일일 캡, 주간 캡, 반복 감액률, 활성화 상태) 튜닝 서버 액션
 */
export async function updateWorkRewardPolicy(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const code = text(formData.get('code'));
  const rawDailyCap = text(formData.get('daily_cap'));
  const rawWeeklyCap = text(formData.get('weekly_cap'));
  const rawDecay = text(formData.get('repeat_decay_percent'));
  const enabled = formData.get('enabled') === 'true' || formData.get('enabled') === 'on';
  const reason = text(formData.get('reason')) || '관리자 콘솔에서 직업 보상 정책 튜닝';

  if (!STEP_UP_CODE.test(code)) return CODE_REQUIRED;

  let daily_cap: number | null = null;
  if (rawDailyCap !== '' && rawDailyCap !== '0' && rawDailyCap !== 'unlimited') {
    const val = Number(rawDailyCap);
    if (!Number.isSafeInteger(val) || val < 0) {
      return { status: 'error', message: '일일 보상 한도는 0 이상의 정수 또는 무제한이어야 합니다.' };
    }
    daily_cap = val;
  }

  let weekly_cap: number | null = null;
  if (rawWeeklyCap !== '' && rawWeeklyCap !== '0' && rawWeeklyCap !== 'unlimited') {
    const val = Number(rawWeeklyCap);
    if (!Number.isSafeInteger(val) || val < 0) {
      return { status: 'error', message: '주간 보상 한도는 0 이상의 정수 또는 무제한이어야 합니다.' };
    }
    weekly_cap = val;
  }

  let repeat_decay_percent = 0;
  if (rawDecay !== '') {
    const val = Number(rawDecay);
    if (!Number.isSafeInteger(val) || val < 0 || val > 100) {
      return { status: 'error', message: '반복 감액률은 0% ~ 100% 사이여야 합니다.' };
    }
    repeat_decay_percent = val;
  }

  try {
    await spendSecondFactorCode(code);
    await mutate('/api/v1/admin/work/policy', {
      method: 'PUT',
      body: {
        daily_cap,
        weekly_cap,
        repeat_decay_percent,
        enabled,
        reason,
        idempotencyKey: idempotencyKey(),
      },
    });

    revalidatePath(PAGE);
    revalidatePath('/work');
    revalidatePath('/admin/economy');

    return {
      status: 'ok',
      message: `직업 보상 정책을 저장했습니다 (일일 한도: ${daily_cap ? `${daily_cap} WLD` : '무제한'}, 반복 감액: ${repeat_decay_percent}%, 상태: ${enabled ? '지급 중' : '중지'}).`,
    };
  } catch (error) {
    return explain(error, '직업 보상 정책을 저장하지 못했습니다.');
  }
}

/**
 * 개별 직업 카탈로그 작업(기본 보상, 경험치, 최소 수행시간, 일일 한도, 활성 상태) 튜닝 서버 액션
 */
export async function updateWorkTask(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const taskId = text(formData.get('taskId'));
  const taskName = text(formData.get('taskName')) || taskId;
  const rawBaseReward = text(formData.get('base_reward'));
  const rawBaseExp = text(formData.get('base_experience'));
  const rawMinDuration = text(formData.get('minimum_duration_seconds'));
  const rawDailyLimit = text(formData.get('daily_limit'));
  const active = formData.get('active') === 'true' || formData.get('active') === 'on';

  if (!taskId) return { status: 'error', message: '작업 식별자(taskId)가 누락되었습니다.' };

  let base_reward: number | undefined;
  if (rawBaseReward !== '') {
    const val = Number(rawBaseReward);
    if (!Number.isSafeInteger(val) || val < 1) {
      return { status: 'error', message: '기본 보상은 1 이상의 정수여야 합니다.' };
    }
    base_reward = val;
  }

  let base_experience: number | undefined;
  if (rawBaseExp !== '') {
    const val = Number(rawBaseExp);
    if (!Number.isSafeInteger(val) || val < 0) {
      return { status: 'error', message: '기본 경험치는 0 이상의 정수여야 합니다.' };
    }
    base_experience = val;
  }

  let minimum_duration_seconds: number | undefined;
  if (rawMinDuration !== '') {
    const val = Number(rawMinDuration);
    if (!Number.isSafeInteger(val) || val < 5 || val > 86400) {
      return { status: 'error', message: '최소 수행 시간은 5초 ~ 86400초(24시간) 사이여야 합니다.' };
    }
    minimum_duration_seconds = val;
  }

  let daily_limit: number | undefined;
  if (rawDailyLimit !== '') {
    const val = Number(rawDailyLimit);
    if (!Number.isSafeInteger(val) || val < 0 || val > 1000) {
      return { status: 'error', message: '일일 수행 제한 횟수는 0(무제한) ~ 1000회 사이여야 합니다.' };
    }
    daily_limit = val;
  }

  try {
    await mutate(`/api/v1/admin/work/tasks/${encodeURIComponent(taskId)}`, {
      method: 'PATCH',
      body: {
        base_reward,
        base_experience,
        minimum_duration_seconds,
        daily_limit,
        active,
        idempotencyKey: idempotencyKey(),
      },
    });

    revalidatePath(PAGE);
    revalidatePath('/work');

    return {
      status: 'ok',
      message: `[${taskName}] 작업 설정을 갱신했습니다 (보상: ${base_reward} WLD, 일일한도: ${daily_limit === 0 ? '무제한' : `${daily_limit}회`}, 소요시간: ${minimum_duration_seconds}초, 상태: ${active ? '제공 중' : '중지'}).`,
    };
  } catch (error) {
    return explain(error, `[${taskName}] 작업 설정을 갱신하지 못했습니다.`);
  }
}
