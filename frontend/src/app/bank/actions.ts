'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { groupDigits } from '@/lib/money';
import { failure, idempotencyKey, mutate, wholeAmount } from '@/lib/mutate';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function depositAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const amount = wholeAmount(formData.get('amount'));
  if (amount === null) {
    return { status: 'error', message: '1 WLD 이상의 정수 금액을 입력해 주세요.' };
  }

  try {
    await mutate('/api/v1/banking/deposit', {
      body: { amount: String(amount), idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/bank');
    revalidatePath('/wallet');
    return { status: 'ok', message: `${groupDigits(amount)} WLD를 복리 예금 계좌에 입금했습니다.` };
  } catch (error) {
    return failure(error, '은행 예금 입금 처리에 실패했습니다. 보유 현금을 확인해 주세요.');
  }
}

export async function withdrawAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const amount = wholeAmount(formData.get('amount'));
  if (amount === null) {
    return { status: 'error', message: '1 WLD 이상의 정수 금액을 입력해 주세요.' };
  }

  try {
    await mutate('/api/v1/banking/withdraw', {
      body: { amount: String(amount), idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/bank');
    revalidatePath('/wallet');
    return { status: 'ok', message: `${groupDigits(amount)} WLD를 현금으로 출금했습니다.` };
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
    const claimed = res?.claimedAmount ? groupDigits(res.claimedAmount) : '';
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
  if (amount === null || BigInt(amount) < 100n) {
    return { status: 'error', message: '대출 신청은 최소 100 WLD 이상부터 가능합니다.' };
  }

  try {
    await mutate('/api/v1/banking/borrow', {
      body: { amount: String(amount), idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/bank');
    revalidatePath('/wallet');
    return { status: 'ok', message: `${groupDigits(amount)} WLD 스마트 신용 대출이 승인 및 지급되었습니다.` };
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
  if (amount === null) {
    return { status: 'error', message: '1 WLD 이상의 상환 금액을 입력해 주세요.' };
  }

  try {
    await mutate('/api/v1/banking/repay', {
      body: { loanId, amount: String(amount), idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/bank');
    revalidatePath('/wallet');
    return { status: 'ok', message: `${groupDigits(amount)} WLD 대출 상환 처리가 완료되었습니다.` };
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
  if (amount === null || BigInt(amount) < 1000n) {
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

export async function createPocketAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get('name') ?? '').trim();
  const targetAmountRaw = formData.get('targetAmount');
  const targetAmount = targetAmountRaw ? wholeAmount(targetAmountRaw) : null;
  const targetDate = String(formData.get('targetDate') ?? '').trim() || null;
  const themeColor = String(formData.get('themeColor') ?? 'sky').trim();
  const iconCode = String(formData.get('iconCode') ?? 'piggy-bank').trim();

  if (!name) {
    return { status: 'error', message: '포켓 통장 이름을 입력해 주세요.' };
  }

  try {
    await mutate('/api/v1/banking/pockets', {
      body: {
        name,
        targetAmount: targetAmount ? String(targetAmount) : undefined,
        targetDate: targetDate || undefined,
        themeColor,
        iconCode,
      },
    });
    revalidatePath('/bank');
    return { status: 'ok', message: `'${name}' 저축 포켓이 성공적으로 개설되었습니다.` };
  } catch (error) {
    return failure(error, '저축 포켓 개설에 실패했습니다.');
  }
}

export async function transferPocketAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const pocketId = String(formData.get('pocketId') ?? '').trim();
  const direction = String(formData.get('direction') ?? 'IN').trim() as 'IN' | 'OUT';
  const amount = wholeAmount(formData.get('amount'));

  if (!UUID.test(pocketId)) {
    return { status: 'error', message: '포켓 통장 식별자가 올바르지 않습니다.' };
  }
  if (amount === null || BigInt(amount) < 1n) {
    return { status: 'error', message: '1 WLD 이상의 이체 금액을 입력해 주세요.' };
  }

  try {
    await mutate(`/api/v1/banking/pockets/${pocketId}/transfer`, {
      body: {
        direction,
        amount: String(amount),
        idempotencyKey: idempotencyKey(),
      },
    });
    revalidatePath('/bank');
    revalidatePath('/wallet');
    const dirLabel = direction === 'IN' ? '포켓으로 입금' : '메인 계좌로 출금';
    return { status: 'ok', message: `${groupDigits(amount)} WLD를 성공적으로 ${dirLabel}했습니다.` };
  } catch (error) {
    return failure(error, '포켓 자금 이체에 실패했습니다. 잔액을 확인해 주세요.');
  }
}

export async function archivePocketAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const pocketId = String(formData.get('pocketId') ?? '').trim();
  if (!UUID.test(pocketId)) {
    return { status: 'error', message: '포켓 통장 식별자가 올바르지 않습니다.' };
  }

  try {
    await mutate(`/api/v1/banking/pockets/${pocketId}/archive`, {
      body: { idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/bank');
    revalidatePath('/wallet');
    return { status: 'ok', message: '저축 포켓이 해지되었으며, 잔여 잔액이 메인 현금 계좌로 안전하게 복구되었습니다.' };
  } catch (error) {
    return failure(error, '저축 포켓 해지 처리에 실패했습니다.');
  }
}
