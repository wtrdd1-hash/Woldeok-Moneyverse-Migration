import { groupDigits } from '@/lib/money';
'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, idempotencyKey, mutate, wholeAmount } from '@/lib/mutate';
import { STEP_UP_CODE, spendSecondFactorCode } from './step-up';

/**
 * The operator console's writes.
 *
 * Every one of them reaches a database function that performs its own
 * operator check — `game_catalog_operator`, `admin_set_user_restriction`, and
 * so on. The guard on the controller decides who may call; the function
 * decides who may act. Neither this file nor the page it serves is part of
 * that decision, and the bounds repeated here exist only so an operator sees
 * which field is wrong rather than a validation document about a DTO.
 *
 * The four high-risk ones spend a TOTP code first, in this same action, so
 * the code the operator typed into the dialog that named the target and the
 * way back is what authorises the change that dialog described. Since
 * two-person approval was retired there is nobody else to object.
 */

/** The refusal every high-risk action gives for a missing or malformed code. */
const CODE_REQUIRED = { status: 'error', message: '실행 직전 인증 코드 6자리를 입력해 주세요.' } as const;

function text(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

export async function setUserRestriction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = text(formData.get('userId'));
  const restricted = formData.get('restricted') === 'true';
  const reason = text(formData.get('reason'));

  if (userId === '') return { status: 'error', message: '대상 사용자를 확인할 수 없어요.' };
  // The API requires a reason for both directions: lifting a restriction is
  // as much an audited act as applying one.
  if (reason === '' || reason.length > 2000) {
    return { status: 'error', message: '사유를 1~2000자로 입력해 주세요.' };
  }
  const code = text(formData.get('code'));
  if (!STEP_UP_CODE.test(code)) return CODE_REQUIRED;

  try {
    await spendSecondFactorCode(code);
    await mutate(`/api/v1/admin/users/${encodeURIComponent(userId)}/restriction`, {
      method: 'PUT',
      body: { restricted, reason },
    });
    revalidatePath('/admin');
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${encodeURIComponent(userId)}`);
    return { status: 'ok', message: restricted ? '이용을 제한했어요.' : '제한을 해제했어요.' };
  } catch (error) {
    return failure(error, '제한 상태를 바꾸지 못했어요.');
  }
}

export async function createStock(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const symbol = text(formData.get('symbol'));
  const name = text(formData.get('name'));
  const description = text(formData.get('description'));
  const price = wholeAmount(formData.get('price'));
  const shares = wholeAmount(formData.get('shares'));

  if (symbol === '' || symbol.length > 12) {
    return { status: 'error', message: '종목 코드를 1~12자로 입력해 주세요.' };
  }
  if (name === '' || name.length > 100) {
    return { status: 'error', message: '종목명을 1~100자로 입력해 주세요.' };
  }
  if (price === null) return { status: 'error', message: '시작 가격은 1 이상 정수여야 해요.' };
  if (shares === null) {
    return { status: 'error', message: '발행 주식 수는 1 이상 정수여야 해요.' };
  }

  try {
    await mutate('/api/v1/admin/stocks', {
      body: { symbol, name, price, shares, ...(description === '' ? {} : { description }) },
    });
    revalidatePath('/admin');
    revalidatePath('/admin/market');
    return { status: 'ok', message: `${symbol} 종목을 등록했어요.` };
  } catch (error) {
    return failure(error, '종목을 등록하지 못했어요. 코드가 이미 있는지 확인해 주세요.');
  }
}

/**
 * Sets a price by hand.
 *
 * The day's open moves with it, because the market's walk clamps to a band
 * around that open — a price set outside it would be dragged back within the
 * second. The message says so, because an operator who is not told will read
 * the reset day change as the control having half-worked.
 */
export async function setStockPrice(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const stockId = text(formData.get('stockId'));
  const price = wholeAmount(formData.get('price'));

  if (stockId === '') return { status: 'error', message: '종목을 찾을 수 없어요.' };
  if (price === null || Number(price) < 10) {
    return { status: 'error', message: '가격은 10 이상 정수여야 해요.' };
  }
  const code = text(formData.get('code'));
  if (!STEP_UP_CODE.test(code)) return CODE_REQUIRED;

  try {
    await spendSecondFactorCode(code);
    await mutate(`/api/v1/admin/stocks/${encodeURIComponent(stockId)}/price`, {
      body: { price, idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/admin/market');
    revalidatePath('/stocks');
    return { status: 'ok', message: '주가를 조정했어요. 오늘의 시가도 이 가격으로 옮겼습니다.' };
  } catch (error) {
    return failure(error, '주가를 조정하지 못했어요.');
  }
}

/**
 * Deletes a stock that has no history.
 *
 * The database refuses anything that has traded or that somebody holds — the
 * trades are a ledger — so the fallback sentence says what to do instead
 * rather than asking the operator to try again.
 */
export async function deleteStock(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const stockId = text(formData.get('stockId'));
  if (stockId === '') return { status: 'error', message: '종목을 찾을 수 없어요.' };
  const code = text(formData.get('code'));
  if (!STEP_UP_CODE.test(code)) return CODE_REQUIRED;

  try {
    await spendSecondFactorCode(code);
    await mutate(`/api/v1/admin/stocks/${encodeURIComponent(stockId)}`, { method: 'DELETE' });
    revalidatePath('/admin/market');
    revalidatePath('/stocks');
    return { status: 'ok', message: '종목을 삭제했어요.' };
  } catch (error) {
    return failure(
      error,
      '거래 기록이 있거나 보유자가 있는 종목은 삭제할 수 없어요. 거래 정지를 사용해 주세요.',
    );
  }
}

export async function setStockActive(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const stockId = text(formData.get('stockId'));
  const active = formData.get('active') === 'true';
  if (stockId === '') return { status: 'error', message: '종목을 확인할 수 없어요.' };

  try {
    await mutate(`/api/v1/admin/stocks/${encodeURIComponent(stockId)}`, {
      method: 'PATCH',
      body: { active },
    });
    revalidatePath('/admin');
    return { status: 'ok', message: active ? '거래를 재개했어요.' : '거래를 정지했어요.' };
  } catch (error) {
    return failure(error, '종목 상태를 바꾸지 못했어요.');
  }
}

export async function applyCorporateAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const stockId = text(formData.get('stockId'));
  const action = text(formData.get('action'));
  const factor = wholeAmount(formData.get('factor'));

  if (stockId === '') return { status: 'error', message: '종목을 확인할 수 없어요.' };
  if (action !== 'split' && action !== 'reverse_split') {
    return { status: 'error', message: '액면분할인지 병합인지 확인할 수 없어요.' };
  }
  if (factor === null) return { status: 'error', message: '비율은 1 이상 정수여야 해요.' };
  const code = text(formData.get('code'));
  if (!STEP_UP_CODE.test(code)) return CODE_REQUIRED;

  try {
    await spendSecondFactorCode(code);
    await mutate(`/api/v1/admin/stocks/${encodeURIComponent(stockId)}/corporate-actions`, {
      body: { action, factor, idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/admin');
    return { status: 'ok', message: '기업 활동을 적용했어요.' };
  } catch (error) {
    return failure(error, '기업 활동을 적용하지 못했어요.');
  }
}

export async function setBusinessActive(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const businessId = text(formData.get('businessId'));
  const active = formData.get('active') === 'true';
  if (businessId === '') return { status: 'error', message: '사업을 확인할 수 없어요.' };

  try {
    await mutate(`/api/v1/admin/business-types/${encodeURIComponent(businessId)}`, {
      method: 'PATCH',
      body: { active },
    });
    revalidatePath('/admin');
    return { status: 'ok', message: active ? '판매를 재개했어요.' : '판매를 중지했어요.' };
  } catch (error) {
    return failure(error, '사업 상태를 바꾸지 못했어요.');
  }
}

export async function createSeasonEvent(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const title = text(formData.get('title'));
  const description = text(formData.get('description'));
  const costWld = wholeAmount(formData.get('costWld'));
  const pointsPerEntry = wholeAmount(formData.get('pointsPerEntry'));

  if (title === '' || title.length > 100) {
    return { status: 'error', message: '제목을 1~100자로 입력해 주세요.' };
  }
  if (costWld === null) return { status: 'error', message: '참가비는 1 이상 정수여야 해요.' };
  if (pointsPerEntry === null) {
    return { status: 'error', message: '회당 점수는 1 이상 정수여야 해요.' };
  }

  try {
    await mutate('/api/v1/admin/season-events', {
      body: { title, costWld, pointsPerEntry, ...(description === '' ? {} : { description }) },
    });
    revalidatePath('/admin');
    return { status: 'ok', message: '시즌 이벤트를 등록했어요.' };
  } catch (error) {
    return failure(error, '시즌 이벤트를 등록하지 못했어요.');
  }
}

export async function setSeasonEventActive(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const eventId = text(formData.get('eventId'));
  const active = formData.get('active') === 'true';
  if (eventId === '') return { status: 'error', message: '이벤트를 확인할 수 없어요.' };

  try {
    await mutate(`/api/v1/admin/season-events/${encodeURIComponent(eventId)}`, {
      method: 'PATCH',
      body: { active },
    });
    revalidatePath('/admin');
    return { status: 'ok', message: active ? '이벤트를 재개했어요.' : '이벤트를 중지했어요.' };
  } catch (error) {
    return failure(error, '이벤트 상태를 바꾸지 못했어요.');
  }
}


export async function payoutToUser(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = formData.get('userId');
  const amount = formData.get('amount');
  const reason = formData.get('reason');

  if (typeof userId !== 'string' || !userId) {
    return { status: 'error', message: '대상 회원을 찾을 수 없습니다.' };
  }
  const parsedAmount = wholeAmount(amount);
  if (parsedAmount === null || parsedAmount <= 0) {
    return { status: 'error', message: '지급할 올바른 WLD 금액을 입력해 주세요.' };
  }
  if (typeof reason !== 'string' || reason.trim().length < 10) {
    return { status: 'error', message: '지급 사유를 10자 이상 구체적으로 적어 주세요.' };
  }

  try {
    await mutate('/api/v1/admin/economy/bulk-payouts', {
      method: 'POST',
      body: JSON.stringify({
        idempotencyKey: idempotencyKey(),
        userIds: [userId],
        amount: parsedAmount,
        reason: reason.trim(),
      }),
    });
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}`);
    return { status: 'ok', message: `${groupDigits(String(parsedAmount))} WLD를 국고에서 지급했습니다.` };
  } catch (error) {
    return failure(error, '자산 지급을 실행하지 못했습니다. 관리자 2차 인증을 확인해 주세요.');
  }
}

export async function reverseUserTransaction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = formData.get('userId');
  const transactionId = formData.get('transactionId');
  const reason = formData.get('reason');

  if (typeof transactionId !== 'string' || !transactionId) {
    return { status: 'error', message: '회수/역분개할 거래 ID를 입력해 주세요.' };
  }
  if (typeof reason !== 'string' || reason.trim().length < 10) {
    return { status: 'error', message: '회수 사유를 10자 이상 구체적으로 적어 주세요.' };
  }

  try {
    await mutate(`/api/v1/admin/economy/transactions/${encodeURIComponent(transactionId)}/reversal`, {
      method: 'POST',
      body: JSON.stringify({
        idempotencyKey: idempotencyKey(),
        reason: reason.trim(),
      }),
    });
    if (typeof userId === 'string' && userId) {
      revalidatePath(`/admin/users/${userId}`);
    }
    revalidatePath('/admin/users');
    return { status: 'ok', message: '해당 거래의 역분개(회수) 보정 처리를 완료했습니다.' };
  } catch (error) {
    return failure(error, '거래를 회수하지 못했습니다. 이미 역분개됐거나 종속된 기록이 있는지 확인해 주세요.');
  }
}
