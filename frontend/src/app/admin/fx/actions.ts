'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';
import { failure, mutate } from '@/lib/mutate';
import { requireAdminConsole } from '@/lib/session';
import type { FxStatusData } from './fx-control-tower';

type ApiEnvelope = { readonly success?: boolean; readonly data?: unknown };
type FxActionResult<T> = { readonly ok: true; readonly data: T } | { readonly ok: false; readonly error: string };
type InterventionReceipt = { readonly newRate: number; readonly newReservesUsd: number };
type DrawdownReceipt = { readonly newReservesUsd: number };
type SettlementReceipt = { readonly refundWld: number; readonly contract: { readonly realizedPnlWld: number | null } };
type HaltReceipt = { readonly isHalted: boolean };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function verified<T>(payload: ApiEnvelope, check: (data: Record<string, unknown>) => boolean): T {
  if (payload?.success !== true || !isRecord(payload.data) || !check(payload.data)) {
    throw new Error('Unverified FX operation receipt');
  }
  return payload.data as T;
}

function amountValid(amount: number): boolean {
  return Number.isSafeInteger(amount) && amount > 0 && amount <= 1_000_000_000;
}

function uuidValid(id: string): boolean {
  return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

async function execute<T>(
  path: string,
  body: unknown,
  check: (data: Record<string, unknown>) => boolean,
  fallback: string,
): Promise<FxActionResult<T>> {
  // A server action is callable independently of the page that rendered it.
  await requireAdminConsole('/admin/fx');
  try {
    const payload = await mutate<ApiEnvelope>(path, { body });
    const data = verified<T>(payload, check);
    revalidatePath('/admin/fx');
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: failure(error, fallback).message ?? fallback ?? fallback };
  }
}

export async function getFxStatus(): Promise<FxStatusData> {
  await requireAdminConsole('/admin/fx');
  const payload = await api<ApiEnvelope>('/api/v1/admin/fx/status');
  return verified<FxStatusData>(
    payload,
    (data) => isRecord(data.reserves) && finite(data.reserves.currentRate)
      && typeof data.reserves.isHalted === 'boolean'
      && Array.isArray(data.history) && Array.isArray(data.txs),
  );
}

export async function interveneFx(
  type: 'SELL_USD' | 'BUY_USD',
  amountUsd: number,
): Promise<FxActionResult<InterventionReceipt>> {
  if ((type !== 'SELL_USD' && type !== 'BUY_USD') || !amountValid(amountUsd)) {
    return { ok: false, error: '시장개입 유형과 금액을 확인해 주세요.' };
  }
  return execute('/api/v1/admin/fx/intervene', { type, amountUsd },
    (data) => finite(data.newRate) && data.newRate > 0 && finite(data.newReservesUsd) && data.newReservesUsd >= 0,
    '시장개입 결과를 확인하지 못했습니다.');
}

export async function drawdownFx(
  agreementId: string,
  amountUsd: number,
): Promise<FxActionResult<DrawdownReceipt>> {
  if (!uuidValid(agreementId) || !amountValid(amountUsd)) {
    return { ok: false, error: '스왑 협정과 인출 금액을 확인해 주세요.' };
  }
  return execute('/api/v1/admin/fx/swaps/drawdown',
    { agreementId, amountUsd, purpose: '외환위기 대응 긴급 유동성 수혈 및 시장 안정화' },
    (data) => finite(data.newReservesUsd) && data.newReservesUsd >= 0,
    '통화스왑 인출 결과를 확인하지 못했습니다.');
}

export async function settleFx(contractId: string): Promise<FxActionResult<SettlementReceipt>> {
  if (!uuidValid(contractId)) return { ok: false, error: '정산할 선물환 계약을 확인해 주세요.' };
  return execute('/api/v1/admin/fx/forward/settle', { contractId },
    (data) => finite(data.refundWld) && data.refundWld >= 0 && isRecord(data.contract)
      && (data.contract.realizedPnlWld === null || finite(data.contract.realizedPnlWld)),
    '선물환 정산 결과를 확인하지 못했습니다.');
}

export async function toggleFxHalt(isHalted: boolean): Promise<FxActionResult<HaltReceipt>> {
  if (typeof isHalted !== 'boolean') return { ok: false, error: '외환시장 상태를 확인해 주세요.' };
  return execute('/api/v1/admin/fx/halt', { isHalted },
    (data) => data.isHalted === isHalted,
    '외환시장 상태 변경 결과를 확인하지 못했습니다.');
}
