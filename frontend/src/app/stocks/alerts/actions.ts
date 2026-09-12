'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, mutate, wholeAmount, wholeNumber } from '@/lib/mutate';

const PRICE_CONDITIONS = new Set(['price_at_or_above', 'price_at_or_below']);
const CHANGE_CONDITIONS = new Set(['day_change_at_or_above', 'day_change_at_or_below']);

export async function createStockAlert(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const stockId = String(formData.get('stockId') ?? '');
  const conditionKind = String(formData.get('conditionKind') ?? '');
  const thresholdRaw = String(formData.get('threshold') ?? '').replaceAll(',', '').trim();
  const cooldownMinutes = wholeNumber(formData.get('cooldownMinutes'));
  if (!stockId) return { status: 'error', message: '종목을 선택해 주세요.' };
  if (!PRICE_CONDITIONS.has(conditionKind) && !CHANGE_CONDITIONS.has(conditionKind)) {
    return { status: 'error', message: '알림 조건을 확인해 주세요.' };
  }
  if (cooldownMinutes === null || cooldownMinutes < 5 || cooldownMinutes > 10080) {
    return { status: 'error', message: '재알림 간격은 5분에서 7일 사이로 입력해 주세요.' };
  }

  let thresholdAmount: string | undefined;
  let thresholdBps: number | undefined;
  if (PRICE_CONDITIONS.has(conditionKind)) {
    thresholdAmount = wholeAmount(thresholdRaw) ?? undefined;
    if (!thresholdAmount) return { status: 'error', message: '가격 기준은 1 WLD 이상의 정수로 입력해 주세요.' };
  } else {
    if (!/^-?\d+$/.test(thresholdRaw)) return { status: 'error', message: '변동 기준은 bp 정수로 입력해 주세요.' };
    const parsed = Number(thresholdRaw);
    if (!Number.isSafeInteger(parsed) || parsed < -100000 || parsed > 100000) {
      return { status: 'error', message: '변동 기준은 -100000~100000 bp 범위로 입력해 주세요.' };
    }
    thresholdBps = parsed;
  }

  try {
    await mutate('/api/v1/stocks/alerts', {
      body: {
        stockId,
        conditionKind,
        ...(thresholdAmount === undefined ? {} : { thresholdAmount }),
        ...(thresholdBps === undefined ? {} : { thresholdBps }),
        cooldownSeconds: cooldownMinutes * 60,
      },
    });
    revalidatePath('/stocks/alerts');
    return { status: 'ok', message: '조건부 알림을 만들었어요.' };
  } catch (error) {
    return failure(error, '조건부 알림을 만들 수 없어요.');
  }
}

export async function deleteStockAlert(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const alertId = String(formData.get('alertId') ?? '');
  if (!alertId) return { status: 'error', message: '삭제할 알림을 확인할 수 없어요.' };
  try {
    await mutate(`/api/v1/stocks/alerts/${encodeURIComponent(alertId)}`, { method: 'DELETE' });
    revalidatePath('/stocks/alerts');
    return { status: 'ok', message: '조건부 알림을 삭제했어요.', tone: 'neutral' };
  } catch (error) {
    return failure(error, '조건부 알림을 삭제할 수 없어요.');
  }
}
