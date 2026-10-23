'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';
import { failure, mutate } from '@/lib/mutate';
import type { KdicOverviewData } from './kdic-control-tower';

type Result<T> = { success: true; data: T } | { success: false; error: string };

type PremiumReceipt = { totalCollectedWld: number; recordsCount: number };
type LiquidityReceipt = { newBisRatioPct: number };
type PayoutReceipt = { payoutAmountWld: number };

async function runKdicMutation<T>(path: string, body?: object): Promise<Result<T>> {
  try {
    // mutate obtains a per-session CSRF token server-side, never from the browser.
    const result = await mutate<{ success: boolean; data?: T }>(path, { body });
    if (!result.success || !result.data) return { success: false, error: '집행 결과를 확인할 수 없습니다.' };
    revalidatePath('/admin/kdic');
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: failure(error, '요청을 처리하지 못했습니다.').message ?? '요청을 처리하지 못했습니다.' };
  }
}

export async function getKdicOverview(): Promise<Result<KdicOverviewData>> {
  try {
    const result = await api<{ success: boolean; data?: KdicOverviewData }>('/api/v1/admin/kdic/overview');
    if (!result.success || !result.data) return { success: false, error: '관제 자료를 확인할 수 없습니다.' };
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: failure(error, '관제 자료를 조회하지 못했습니다.').message ?? '관제 자료를 조회하지 못했습니다.' };
  }
}

export async function assessKdicPremiums(): Promise<Result<PremiumReceipt>> {
  return runKdicMutation<PremiumReceipt>('/api/v1/admin/kdic/assess-premiums');
}

export async function injectKdicLiquidity(institutionId: string, amountWld: number): Promise<Result<LiquidityReceipt>> {
  if (!/^[A-Z][A-Z0-9_]{2,63}$/.test(institutionId) || !Number.isSafeInteger(amountWld) || amountWld <= 0) {
    return { success: false, error: '금융기관 및 금액을 다시 확인해 주세요.' };
  }
  return runKdicMutation<LiquidityReceipt>('/api/v1/admin/kdic/liquidity-loan', { institutionId, amountWld });
}

export async function executeKdicPayout(institutionId: string, userId: string): Promise<Result<PayoutReceipt>> {
  if (!/^[A-Z][A-Z0-9_]{2,63}$/.test(institutionId) || !userId.trim() || userId.length > 128) {
    return { success: false, error: '금융기관 및 대상 회원을 다시 확인해 주세요.' };
  }
  return runKdicMutation<PayoutReceipt>('/api/v1/admin/kdic/payout', { institutionId, userId: userId.trim() });
}
