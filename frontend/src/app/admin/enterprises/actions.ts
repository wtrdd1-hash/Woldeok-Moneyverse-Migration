'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';
import { failure, mutate } from '@/lib/mutate';
import { requireAdminConsole } from '@/lib/session';
import type { DividendLogItem } from './enterprise-control-tower';

interface HarvestReceipt {
  readonly total_dividends_collected: string;
  readonly enterprises_processed: number;
  readonly treasury_balance_after: string;
}

type HarvestResult =
  | { ok: true; receipt: HarvestReceipt; logs: DividendLogItem[] | null }
  | { ok: false; error: string };

type StatusResult = { ok: true } | { ok: false; error: string };

const isWld = (value: unknown): value is string =>
  typeof value === 'string' && /^(0|[1-9]\d*)$/.test(value);

const isHarvestReceipt = (value: unknown): value is HarvestReceipt => {
  if (!value || typeof value !== 'object') return false;
  const receipt = value as Partial<HarvestReceipt>;
  return (
    isWld(receipt.total_dividends_collected) &&
    isWld(receipt.treasury_balance_after) &&
    Number.isSafeInteger(receipt.enterprises_processed) &&
    (receipt.enterprises_processed as number) >= 0
  );
};

export async function harvestEnterpriseDividends(): Promise<HarvestResult> {
  await requireAdminConsole('/admin/enterprises');
  try {
    const receipt = await mutate<unknown>('/api/v1/admin/enterprises/soes/harvest', { method: 'POST' });
    if (!isHarvestReceipt(receipt)) {
      return { ok: false, error: '국고 수취 영수증을 검증할 수 없어 성공으로 표시하지 않았습니다.' };
    }
    revalidatePath('/admin/enterprises');
    // A failed read does not undo a committed payout. Never fabricate rows to fill the gap.
    let logs: DividendLogItem[] | null = null;
    try {
      const fresh = await api<unknown>('/api/v1/admin/enterprises/dividend-logs?limit=20');
      if (Array.isArray(fresh)) logs = fresh as DividendLogItem[];
    } catch {
      // The confirmed receipt remains authoritative; history is temporarily unavailable.
    }
    return { ok: true, receipt, logs };
  } catch (error) {
    return {
      ok: false,
      error: failure(error, '공기업 배당 국고 수취 결과를 확인할 수 없습니다.').message ?? '공기업 배당 국고 수취 결과를 확인할 수 없습니다.',
    };
  }
}

export async function updateEnterpriseStatus(code: string, status: string): Promise<StatusResult> {
  await requireAdminConsole('/admin/enterprises');
  if (!/^[A-Z][A-Z0-9_]{1,63}$/.test(code) || !['ACTIVE', 'PAUSED', 'PRIVATIZING'].includes(status)) {
    return { ok: false, error: '공기업 코드 또는 운영 상태가 올바르지 않습니다.' };
  }
  try {
    const result = await mutate<unknown>(
      `/api/v1/admin/enterprises/soes/${encodeURIComponent(code)}`,
      { method: 'PUT', body: { status } },
    );
    if (!result || typeof result !== 'object') {
      return { ok: false, error: '상태 변경 결과가 확인되지 않았습니다.' };
    }
    const receipt = result as { success?: unknown; code?: unknown; status?: unknown };
    if (receipt.success !== true || receipt.code !== code || receipt.status !== status) {
      return { ok: false, error: '공기업 상태 변경이 확인되지 않았습니다.' };
    }
    revalidatePath('/admin/enterprises');
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: failure(error, '공기업 상태 변경 결과를 확인할 수 없습니다.').message ?? '공기업 상태 변경 결과를 확인할 수 없습니다.',
    };
  }
}
