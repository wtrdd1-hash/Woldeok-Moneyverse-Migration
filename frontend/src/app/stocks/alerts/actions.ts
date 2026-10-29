'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { api } from '@/lib/api';
import { failure, mutate, wholeAmount, wholeNumber } from '@/lib/mutate';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRICE_CONDITIONS = new Set(['price_at_or_above', 'price_at_or_below']);
const CHANGE_CONDITIONS = new Set(['day_change_at_or_above', 'day_change_at_or_below']);

interface AlertReadback {
  readonly alert_id: string;
  readonly stock_id: string;
  readonly condition_kind: string;
  readonly threshold_amount: string | null;
  readonly threshold_bps: number | null;
  readonly cooldown_seconds: number;
}

async function verifiedOwnerAlerts(): Promise<readonly AlertReadback[]> {
  const response: unknown = await api<unknown>('/api/v1/stocks/alerts');
  if (typeof response !== 'object' || response === null || !('alerts' in response) || !Array.isArray(response.alerts)) {
    throw new Error('stock alert owner readback unavailable');
  }
  const rows: unknown[] = response.alerts;
  if (!rows.every((row): row is AlertReadback => {
    if (typeof row !== 'object' || row === null) return false;
    const rule = row as Record<string, unknown>;
    return typeof rule.alert_id === 'string' && UUID.test(rule.alert_id) &&
      typeof rule.stock_id === 'string' && UUID.test(rule.stock_id) &&
      typeof rule.condition_kind === 'string' &&
      (rule.threshold_amount === null || typeof rule.threshold_amount === 'string') &&
      (rule.threshold_bps === null || Number.isSafeInteger(rule.threshold_bps)) &&
      Number.isSafeInteger(rule.cooldown_seconds);
  })) throw new Error('invalid stock alert owner readback');
  return rows;
}

export async function createStockAlert(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const stockId = String(formData.get('stockId') ?? '');
  const conditionKind = String(formData.get('conditionKind') ?? '');
  const thresholdRaw = String(formData.get('threshold') ?? '').replaceAll(',', '').trim();
  const cooldownMinutes = wholeNumber(formData.get('cooldownMinutes'));
  if (!UUID.test(stockId)) return { status: 'error', message: '종목을 선택해 주세요.' };
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
    const receipt: unknown = await mutate('/api/v1/stocks/alerts', {
      body: {
        stockId,
        conditionKind,
        ...(thresholdAmount === undefined ? {} : { thresholdAmount }),
        ...(thresholdBps === undefined ? {} : { thresholdBps }),
        cooldownSeconds: cooldownMinutes * 60,
      },
    });
    if (typeof receipt !== 'object' || receipt === null || !('alertId' in receipt) ||
      typeof receipt.alertId !== 'string' || !UUID.test(receipt.alertId)) {
      throw new Error('invalid stock alert creation receipt');
    }
    const alerts = await verifiedOwnerAlerts();
    const matching = alerts.filter((alert) => alert.alert_id.toLowerCase() === receipt.alertId.toLowerCase());
    if (matching.length !== 1 || matching[0]?.stock_id.toLowerCase() !== stockId.toLowerCase() ||
      matching[0]?.condition_kind !== conditionKind || matching[0]?.cooldown_seconds !== cooldownMinutes * 60 ||
      matching[0]?.threshold_amount !== (thresholdAmount ?? null) ||
      matching[0]?.threshold_bps !== (thresholdBps ?? null)) {
      throw new Error('stock alert was not persisted as requested');
    }
    revalidatePath('/stocks/alerts');
    return { status: 'ok', message: '조건부 알림을 만들었어요.' };
  } catch (error) {
    return failure(error, '조건부 알림 저장 여부를 확인할 수 없어요. 새로고침 후 다시 확인해 주세요.');
  }
}

export async function deleteStockAlert(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const alertId = String(formData.get('alertId') ?? '');
  if (!UUID.test(alertId)) return { status: 'error', message: '삭제할 알림을 확인할 수 없어요.' };
  try {
    const receipt: unknown = await mutate(`/api/v1/stocks/alerts/${encodeURIComponent(alertId)}`, { method: 'DELETE' });
    if (typeof receipt !== 'object' || receipt === null || !('deleted' in receipt) || receipt.deleted !== true) {
      throw new Error('stock alert deletion was not confirmed');
    }
    const alerts = await verifiedOwnerAlerts();
    if (alerts.some((alert) => alert.alert_id.toLowerCase() === alertId.toLowerCase())) {
      throw new Error('stock alert still exists after deletion');
    }
    revalidatePath('/stocks/alerts');
    return { status: 'ok', message: '조건부 알림을 삭제했어요.', tone: 'neutral' };
  } catch (error) {
    return failure(error, '조건부 알림 삭제 여부를 확인할 수 없어요. 새로고침 후 다시 확인해 주세요.');
  }
}
