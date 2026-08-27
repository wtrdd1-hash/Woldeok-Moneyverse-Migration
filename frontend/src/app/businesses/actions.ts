'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';
import { groupDigits } from '@/lib/money';

/**
 * Buying a business and settling one day of it.
 *
 * Neither sends an amount. The purchase price and the day's revenue minus
 * operating cost are read by the database function inside the transaction
 * that posts them, which is also what enforces the once-per-day rule — a
 * second settlement on the same date comes back as a conflict, not a second
 * payout.
 */

export async function purchaseBusiness(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const businessTypeId = String(formData.get('businessTypeId') ?? '');
  if (businessTypeId === '') return { status: 'error', message: '사업을 확인할 수 없어요.' };

  try {
    const receipt = await mutate<{ replayed: boolean }>(
      `/api/v1/business-types/${encodeURIComponent(businessTypeId)}/purchases`,
      { body: { idempotencyKey: idempotencyKey() } },
    );
    revalidatePath('/businesses');
    return {
      status: 'ok',
      message: receipt.replayed
        ? '이미 처리된 사업 구입 기록을 다시 확인했어요.'
        : '사업권을 구입했어요. 내 사업 목록에서 확인해 주세요.',
    };
  } catch (error) {
    return failure(error, '지금은 사업을 구입할 수 없어요.');
  }
}

export async function settleBusiness(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ownershipId = String(formData.get('ownershipId') ?? '');
  if (ownershipId === '') return { status: 'error', message: '정산할 사업을 확인할 수 없어요.' };

  try {
    const receipt = await mutate<{
      grossRevenue: string;
      operatingCost: string;
      netAmount: string;
      replayed: boolean;
    }>(`/api/v1/businesses/${encodeURIComponent(ownershipId)}/settlements`, {
      body: { idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/businesses');
    return {
      status: 'ok',
      message: receipt.replayed
        ? '오늘 정산은 이미 완료했어요.'
        : `매출 ${groupDigits(receipt.grossRevenue)} · 운영비 ${groupDigits(receipt.operatingCost)} · 순수익 ${groupDigits(receipt.netAmount)} WLD를 정산했어요.`,
    };
  } catch (error) {
    return failure(error, '오늘은 이미 정산했거나, 지금은 정산할 수 없어요.');
  }
}
