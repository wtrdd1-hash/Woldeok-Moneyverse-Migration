'use server';

import { revalidatePath } from 'next/cache';
import { ApiError } from '@/lib/api';
import type { ActionState } from '@/lib/action-state';
import { failure, idempotencyKey, mutate, wholeAmount } from '@/lib/mutate';

/**
 * Every write the wallet can make.
 *
 * All of them share one shape: read the form, refuse locally only what the
 * member can fix themselves, then hand it to the database function that owns
 * the rule. No balance is checked here and no fee is computed here — those
 * live in `economy_post_transaction` and its callers, inside the transaction
 * that posts the entry, which is the only place they can be true.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const TRANSFER_PENDING_MESSAGE =
  '송금 처리 여부를 확인할 수 없습니다. 새 송금을 시작하지 마세요. 동일한 ID·금액·요청 키로만 다시 확인할 수 있습니다.';

export async function transfer(previous: ActionState, formData: FormData): Promise<ActionState> {
  const recipientUserId = String(formData.get('recipientUserId') ?? '').trim();
  const amount = wholeAmount(formData.get('amount'));
  const clientKey = String(formData.get('idempotencyKey') ?? '').trim();
  const pending = previous.errorCode === 'transfer_verification_pending'
    ? previous.transferAttempt : undefined;

  // A prior uncertain commit must never be transformed into a new command by
  // editing a field, even when the client fails to keep its inputs read-only.
  if (pending && (recipientUserId !== pending.recipientUserId
    || amount !== pending.amount || clientKey !== pending.idempotencyKey)) {
    return { ...previous, status: 'error', message: TRANSFER_PENDING_MESSAGE };
  }
  if (!UUID.test(recipientUserId)) {
    return { status: 'error', message: '머니버스 ID 형식(UUID)을 입력해 주세요.' };
  }
  if (amount === null) return { status: 'error', message: '1 WLD 이상 정수만 보낼 수 있어요.' };
  // A server-generated fallback on retry would make an ambiguous transfer
  // look like a new transfer to PostgreSQL's idempotency boundary.
  if (!UUID.test(clientKey)) {
    return { status: 'error', message: '송금 요청 식별자가 없습니다. 화면을 다시 열어 주세요.' };
  }

  const attempt = { recipientUserId, amount, idempotencyKey: clientKey };
  try {
    const receipt = await mutate<unknown>('/api/v1/wallet/transfers', { body: attempt });
    if (!receipt || typeof receipt !== 'object' || !('transactionId' in receipt)
      || typeof receipt.transactionId !== 'string' || !UUID.test(receipt.transactionId)) {
      throw new Error('transfer outcome has no verifiable transaction ID');
    }
    revalidatePath('/wallet');
    return { status: 'ok', message: '송금을 원장에 기록했어요.' };
  } catch (error) {
    // Definitive validation/auth failures on a first attempt do not indicate
    // an unknown commit. Once pending, no error may silently release the hold.
    if (!pending && error instanceof ApiError && [400, 401, 403, 404, 409, 422].includes(error.status)) {
      return failure(error, '지금은 송금을 처리할 수 없어요.');
    }
    return {
      status: 'error', errorCode: 'transfer_verification_pending',
      transferAttempt: attempt, message: TRANSFER_PENDING_MESSAGE,
    };
  }
}

export async function moveBank(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const direction = String(formData.get('direction') ?? '');
  const amount = wholeAmount(formData.get('amount'));
  const clientKey = String(formData.get('idempotencyKey') ?? '').trim();

  if (direction !== 'deposit' && direction !== 'withdraw') {
    return { status: 'error', message: '입금인지 출금인지 확인할 수 없어요.' };
  }
  if (amount === null) return { status: 'error', message: '1 WLD 이상 정수만 입력해 주세요.' };

  try {
    await mutate('/api/v1/bank/movements', {
      body: { direction, amount, idempotencyKey: clientKey || idempotencyKey() },
    });
    revalidatePath('/wallet');
    return {
      status: 'ok',
      message: direction === 'deposit' ? '보관함에 넣었어요.' : '보관함에서 꺼냈어요.',
    };
  } catch (error) {
    return failure(error, '은행 이동이 거절되었어요.');
  }
}

export async function borrow(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const principalAmount = wholeAmount(formData.get('principalAmount'));
  const clientKey = String(formData.get('idempotencyKey') ?? '').trim();

  if (principalAmount === null) {
    return { status: 'error', message: '1 WLD 이상 정수만 신청할 수 있어요.' };
  }

  try {
    await mutate('/api/v1/bank/loans', {
      body: { principalAmount, idempotencyKey: clientKey || idempotencyKey() },
    });
    revalidatePath('/wallet');
    return { status: 'ok', message: '대출을 실행했어요. 원금에 5% 이자가 더해집니다.' };
  } catch (error) {
    return failure(error, '대출 신청이 거절되었어요.');
  }
}

export async function repay(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const loanId = String(formData.get('loanId') ?? '');
  const amount = wholeAmount(formData.get('amount'));
  const clientKey = String(formData.get('idempotencyKey') ?? '').trim();

  if (!UUID.test(loanId)) return { status: 'error', message: '상환할 대출을 확인할 수 없어요.' };
  if (amount === null) return { status: 'error', message: '1 WLD 이상 정수만 상환할 수 있어요.' };

  try {
    await mutate(`/api/v1/bank/loans/${encodeURIComponent(loanId)}/repayments`, {
      body: { amount, idempotencyKey: clientKey || idempotencyKey() },
    });
    revalidatePath('/wallet');
    return { status: 'ok', message: '상환을 기록했어요.' };
  } catch (error) {
    return failure(error, '상환이 거절되었어요.');
  }
}

/**
 * The two reward claims.
 *
 * Both are the same shape and both are idempotent at the database, which
 * returns the original receipt for a repeat rather than paying twice — so a
 * second press on the same day is an ordinary outcome the member is told
 * about, not a fault.
 */
async function claimReward(
  path: string,
  { already, granted }: { readonly already: string; readonly granted: string },
): Promise<ActionState> {
  try {
    const receipt = await mutate<{ amount: string; replayed: boolean }>(path, {
      body: { idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/wallet');
    return { status: 'ok', message: receipt.replayed ? already : granted };
  } catch (error) {
    return failure(error, already);
  }
}

export async function claimDaily(_previous: ActionState): Promise<ActionState> {
  return claimReward('/api/v1/rewards/daily/claims', {
    already: '오늘은 이미 보상을 받았거나, 지금은 받을 수 없어요.',
    granted: '오늘의 보상을 지갑에 넣었어요.',
  });
}
