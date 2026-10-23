'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';
import { failure, mutate } from '@/lib/mutate';
import { requireAdminConsole } from '@/lib/session';
import type { CouponLogItem, TreasuryBondItem, TreasuryBondsOverview } from './bond-control-tower';

type BondAdminData = {
  overview: TreasuryBondsOverview;
  bonds: TreasuryBondItem[];
  couponLogs: CouponLogItem[];
};
type BondAdminRefreshResult =
  | { ok: true; data: BondAdminData }
  | { ok: false; error: string };

interface CouponSettlementReceipt {
  readonly couponsDistributedWld: string;
  readonly maturitiesRedeemedWld: string;
  readonly holdingsProcessed: number;
  readonly maturedCount: number;
}
type CouponSettlementResult =
  | { ok: true; receipt: CouponSettlementReceipt }
  | { ok: false; error: string };

const canonicalWld = (value: unknown): value is string =>
  typeof value === 'string' && /^(0|[1-9]\d*)$/.test(value);

export async function refreshBondAdminData(): Promise<BondAdminRefreshResult> {
  // Redirects are intentional: do not turn failed console authentication into an empty dashboard.
  await requireAdminConsole('/admin/bonds');
  try {
    const [overview, bonds, couponLogs] = await Promise.all([
      api<TreasuryBondsOverview>('/api/v1/admin/bonds/overview'),
      api<TreasuryBondItem[]>('/api/v1/admin/bonds/list'),
      api<CouponLogItem[]>('/api/v1/admin/bonds/coupon-logs?limit=30'),
    ]);
    if (!overview || typeof overview !== 'object' || !Array.isArray(bonds) || !Array.isArray(couponLogs)) {
      return { ok: false, error: '국채 관제 응답이 올바르지 않습니다.' };
    }
    return { ok: true, data: { overview, bonds, couponLogs } };
  } catch (error) {
    return { ok: false, error: failure(error, '국채 관제 데이터를 갱신하지 못했습니다.').message ?? '국채 관제 데이터를 갱신하지 못했습니다.' };
  }
}

export async function distributeBondCoupons(): Promise<CouponSettlementResult> {
  await requireAdminConsole('/admin/bonds');
  try {
    const result = await mutate<unknown>('/api/v1/admin/bonds/distribute-coupons', { method: 'POST' });
    if (!result || typeof result !== 'object') {
      return { ok: false, error: '정산 영수증이 없어 성공으로 표시하지 않았습니다.' };
    }
    const receipt = result as Partial<CouponSettlementReceipt>;
    if (
      !canonicalWld(receipt.couponsDistributedWld) ||
      !canonicalWld(receipt.maturitiesRedeemedWld) ||
      !Number.isSafeInteger(receipt.holdingsProcessed) || (receipt.holdingsProcessed as number) < 0 ||
      !Number.isSafeInteger(receipt.maturedCount) || (receipt.maturedCount as number) < 0
    ) {
      return { ok: false, error: '정산 영수증을 검증할 수 없어 성공으로 표시하지 않았습니다.' };
    }
    revalidatePath('/admin/bonds');
    return { ok: true, receipt: receipt as CouponSettlementReceipt };
  } catch (error) {
    return { ok: false, error: failure(error, '국채 이자 지급의 처리 결과를 확인할 수 없습니다.').message ?? '국채 이자 지급의 처리 결과를 확인할 수 없습니다.' };
  }
}
