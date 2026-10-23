'use server';

import { api } from '@/lib/api';
import { mutate } from '@/lib/mutate';
import type { FxStatusData } from './fx-control-tower';

type FxActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

async function executeFx<T>(path: string, body: unknown): Promise<FxActionResult<T>> {
  try {
    const result = await mutate<{ success: boolean; data?: T }>(path, { method: 'POST', body });
    if (!result.success || result.data === undefined) {
      return { success: false, error: '외환 관리 작업을 확인할 수 없습니다.' };
    }
    return { success: true, data: result.data };
  } catch {
    // Do not leak internal permission, session or DB error details to the browser.
    return { success: false, error: '관리자 세션 또는 요청 권한을 확인해 주세요.' };
  }
}

export async function getFxStatus(): Promise<FxStatusData | null> {
  const result = await api<{ success: boolean; data?: FxStatusData }>('/api/v1/admin/fx/status');
  return result.success && result.data ? result.data : null;
}

export async function interveneFx(type: 'SELL_USD' | 'BUY_USD', amountUsd: number) {
  return executeFx<{ newRate: number; newReservesUsd: number }>('/api/v1/admin/fx/intervene', { type, amountUsd });
}

export async function drawdownFxSwap(agreementId: string, amountUsd: number) {
  return executeFx<{ newReservesUsd: number }>('/api/v1/admin/fx/swaps/drawdown', {
    agreementId,
    amountUsd,
    purpose: '외환위기 대응 긴급 유동성 수혈 및 시장 안정화',
  });
}

export async function settleFxForward(contractId: string) {
  return executeFx<{ refundWld: number; contract: { realizedPnlWld?: number } }>('/api/v1/admin/fx/forward/settle', { contractId });
}

export async function toggleFxHalt(isHalted: boolean) {
  return executeFx<{ isHalted: boolean }>('/api/v1/admin/fx/halt', { isHalted });
}
