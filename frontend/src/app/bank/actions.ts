'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, idempotencyKey, mutate, wholeAmount } from '@/lib/mutate';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function depositAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const amount = wholeAmount(formData.get('amount'));
  if (amount === null || Number(amount) < 1) {
    return { status: 'error', message: '1 WLD 이상의 정수 금액을 입력해 주세요.' };
  }

  try {
    await mutate('/api/v1/banking/deposit', {
      body: { amount: String(amount), idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/bank');
    revalidatePath('/wallet');
    return { status: 'ok', message: `${Number(amount).toLocaleString()} WLD를 복리 예금 계좌에 입금했습니다.` };
  } catch (error) {
    return failure(error, '은행 예금 입금 처리에 실패했습니다. 보유 현금을 확인해 주세요.');
  }
}

export async function withdrawAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const amount = wholeAmount(formData.get('amount'));
  if (amount === null || Number(amount) < 1) {
    return { status: 'error', message: '1 WLD 이상의 정수 금액을 입력해 주세요.' };
  }

  try {
    await mutate('/api/v1/banking/withdraw', {
      body: { amount: String(amount), idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/bank');
    revalidatePath('/wallet');
    return { status: 'ok', message: `${Number(amount).toLocaleString()} WLD를 현금으로 출금했습니다.` };
  } catch (error) {
    return failure(error, '은행 출금 처리에 실패했습니다. 예금 잔액을 확인해 주세요.');
  }
}

export async function claimInterestAction(_previous: ActionState): Promise<ActionState> {
  try {
    const res = await mutate<{ claimedAmount: string; newBankBalance: string }>('/api/v1/banking/claim-interest', {
      body: { idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/bank');
    revalidatePath('/wallet');
    const claimed = res?.claimedAmount ? Number(res.claimedAmount).toLocaleString() : '';
    return {
      status: 'ok',
      message: claimed ? `${claimed} WLD의 복리 예금 이자가 원장에 정산되었습니다!` : '복리 이자가 정산되었습니다.',
    };
  } catch (error) {
    return failure(error, '이자 정산 조건을 충족하지 않았거나 예치 기간이 부족합니다 (최소 30분 이상 경과 필요).');
  }
}

export async function borrowAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const amount = wholeAmount(formData.get('amount'));
  if (amount === null || Number(amount) < 100) {
    return { status: 'error', message: '대출 신청은 최소 100 WLD 이상부터 가능합니다.' };
  }

  try {
    await mutate('/api/v1/banking/borrow', {
      body: { amount: String(amount), idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/bank');
    revalidatePath('/wallet');
    return { status: 'ok', message: `${Number(amount).toLocaleString()} WLD 스마트 신용 대출이 승인 및 지급되었습니다.` };
  } catch (error) {
    return failure(error, '대출 실행이 거절되었습니다. 신용 한도 또는 기존 미상환 대출 여부를 확인해 주세요.');
  }
}

export async function repayAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const loanId = String(formData.get('loanId') ?? '').trim();
  const amount = wholeAmount(formData.get('amount'));

  if (!UUID.test(loanId)) {
    return { status: 'error', message: '대출 식별 번호가 올바르지 않습니다.' };
  }
  if (amount === null || Number(amount) < 1) {
    return { status: 'error', message: '1 WLD 이상의 상환 금액을 입력해 주세요.' };
  }

  try {
    await mutate('/api/v1/banking/repay', {
      body: { loanId, amount: String(amount), idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/bank');
    revalidatePath('/wallet');
    return { status: 'ok', message: `${Number(amount).toLocaleString()} WLD 대출 상환 처리가 완료되었습니다.` };
  } catch (error) {
    return failure(error, '대출 상환에 실패했습니다. 보유 현금 잔액을 확인해 주세요.');
  }
}

export async function purchaseBondAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const bondCode = String(formData.get('bondCode') ?? '').trim();
  const amount = wholeAmount(formData.get('amount'));

  if (!bondCode) {
    return { status: 'error', message: '국채 상품을 선택해 주세요.' };
  }
  if (amount === null || Number(amount) < 1000) {
    return { status: 'error', message: '국채 매입은 최소 1,000 WLD 이상이어야 합니다.' };
  }

  try {
    await mutate('/api/v1/banking/bonds/purchase', {
      body: { bondCode, amount: String(amount), idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/bank');
    revalidatePath('/wallet');
    return { status: 'ok', message: '가상 국채 매입이 완료되었습니다. 만기 시 약정 수익률이 함께 지급됩니다.' };
  } catch (error) {
    return failure(error, '국채 매입에 실패했습니다. 보유 현금 잔액을 확인해 주세요.');
  }
}

export async function redeemBondAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const bondId = String(formData.get('bondId') ?? '').trim();
  if (!UUID.test(bondId)) {
    return { status: 'error', message: '국채 식별자가 유효하지 않습니다.' };
  }

  try {
    await mutate(`/api/v1/banking/bonds/${bondId}/redeem`, {
      body: { idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/bank');
    revalidatePath('/wallet');
    return { status: 'ok', message: '가상 국채 만기 원금과 확정 이자가 현금 지갑으로 전액 지급되었습니다!' };
  } catch (error) {
    return failure(error, '국채 상환 수령에 실패했습니다. 만기 도래 여부를 확인해 주세요.');
  }
}
