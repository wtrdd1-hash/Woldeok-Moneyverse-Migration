'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';
import { groupDigits } from '@/lib/money';

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

export async function settleBusinessV2(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ownershipId = String(formData.get('ownershipId') ?? '');
  if (!ownershipId) return { status: 'error', message: '사업 정보를 확인할 수 없습니다.' };

  try {
    const receipt = await mutate<{
      grossRevenue: string;
      operatingCost: string;
      netAmount: string;
      replayed: boolean;
    }>(`/api/v1/businesses/${encodeURIComponent(ownershipId)}/settle-v2`, {
      body: { idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/businesses');
    revalidatePath('/wallet');

    if (receipt.replayed) {
      return { status: 'ok', message: '오늘 정산은 이미 완료되었습니다.' };
    }
    return {
      status: 'ok',
      message: `🎉 일일 정산 완료! 총 매출 ${groupDigits(receipt.grossRevenue)} WLD 지급 (SYSTEM_MINT), 운영비 ${groupDigits(receipt.operatingCost)} WLD 소각 (SYSTEM_SINK). 순수익 ${groupDigits(receipt.netAmount)} WLD가 지갑에 입금되었습니다!`,
    };
  } catch (error) {
    return failure(error, '오늘 이미 정산되었거나, 잔액 부족 또는 미정산 유예 기간을 확인해 주세요.');
  }
}

export async function activateLicenseAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const catalogCode = String(formData.get('catalogCode') ?? '');
  if (!catalogCode) return { status: 'error', message: '라이선스 아이템을 확인할 수 없습니다.' };

  try {
    const res = await mutate<{
      ownership_id: string;
      business_name: string;
      daily_revenue: string;
      daily_operating_cost: string;
    }>('/api/v1/businesses/activate-license', {
      body: { catalogCode, idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/businesses');
    revalidatePath('/inventory');
    return {
      status: 'ok',
      message: `🏢 축하합니다! [${res.business_name}] 가상 사업체가 성공적으로 설립되었습니다! 이제 매일 일일 정산 수익을 수령할 수 있습니다.`,
    };
  } catch (error) {
    return failure(error, '사업체 설립에 실패했습니다. 인벤토리에 라이선스를 보유 중인지, 이미 동일한 사업체를 운영 중인지 확인해 주세요.');
  }
}

export async function applyBoostAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ownershipId = String(formData.get('ownershipId') ?? '');
  const boostCode = String(formData.get('boostCode') ?? '');
  if (!ownershipId || !boostCode) return { status: 'error', message: '부스트 정보를 확인할 수 없습니다.' };

  try {
    await mutate(`/api/v1/businesses/${encodeURIComponent(ownershipId)}/boost`, {
      body: { boostCode },
    });
    revalidatePath('/businesses');
    revalidatePath('/inventory');
    return {
      status: 'ok',
      message: '⚡ 사업체 부스트 아이템이 성공적으로 장착되었습니다! 향후 일일 정산에 즉시 반영됩니다.',
    };
  } catch (error) {
    return failure(error, '부스트 장착에 실패했습니다. 인벤토리에 소모품을 보유 중인지 확인해 주세요.');
  }
}
