'use server';

import { revalidatePath } from 'next/cache';
import { ApiError } from '@/lib/api';
import type { ActionState } from '@/lib/action-state';
import { failure, idempotencyKey, mutate, wholeAmount } from '@/lib/mutate';
import { pick } from '@/lib/copy';
import { getServerLocale } from '@/lib/locale-server';
import { ACTION_COPY } from './action-copy';

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

export async function transfer(previous: ActionState, formData: FormData): Promise<ActionState> {
  const locale = await getServerLocale();
  const recipientUserId = String(formData.get('recipientUserId') ?? '').trim();
  const amount = wholeAmount(formData.get('amount'));
  const clientKey = String(formData.get('idempotencyKey') ?? '').trim();
  const pending = previous.errorCode === 'transfer_verification_pending'
    ? previous.transferAttempt : undefined;

  // A prior uncertain commit must never be transformed into a new command by
  // editing a field, even when the client fails to keep its inputs read-only.
  if (pending && (recipientUserId !== pending.recipientUserId
    || amount !== pending.amount || clientKey !== pending.idempotencyKey)) {
    return { ...previous, status: 'error', message: pick(locale, ACTION_COPY.transferPending) };
  }
  if (!UUID.test(recipientUserId)) {
    return { status: 'error', message: pick(locale, ACTION_COPY.recipientInvalid) };
  }
  if (amount === null) return { status: 'error', message: pick(locale, ACTION_COPY.transferAmountInvalid) };
  // A server-generated fallback on retry would make an ambiguous transfer
  // look like a new transfer to PostgreSQL's idempotency boundary.
  if (!UUID.test(clientKey)) {
    return { status: 'error', message: pick(locale, ACTION_COPY.transferKeyMissing) };
  }

  const attempt = { recipientUserId, amount, idempotencyKey: clientKey };
  try {
    const receipt = await mutate<unknown>('/api/v1/wallet/transfers', { body: attempt });
    if (!receipt || typeof receipt !== 'object' || !('transactionId' in receipt)
      || typeof receipt.transactionId !== 'string' || !UUID.test(receipt.transactionId)) {
      throw new Error('transfer outcome has no verifiable transaction ID');
    }
    revalidatePath('/wallet');
    return { status: 'ok', message: pick(locale, ACTION_COPY.transferDone) };
  } catch (error) {
    // Definitive validation/auth failures on a first attempt do not indicate
    // an unknown commit. Once pending, no error may silently release the hold.
    if (!pending && error instanceof ApiError && [400, 401, 403, 404, 409, 422].includes(error.status)) {
      return failure(error, pick(locale, ACTION_COPY.transferRefused));
    }
    return {
      status: 'error', errorCode: 'transfer_verification_pending',
      transferAttempt: attempt, message: pick(locale, ACTION_COPY.transferPending),
    };
  }
}

export async function moveBank(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const locale = await getServerLocale();
  const direction = String(formData.get('direction') ?? '');
  const amount = wholeAmount(formData.get('amount'));
  const clientKey = String(formData.get('idempotencyKey') ?? '').trim();

  if (direction !== 'deposit' && direction !== 'withdraw') {
    return { status: 'error', message: pick(locale, ACTION_COPY.directionInvalid) };
  }
  if (amount === null) return { status: 'error', message: pick(locale, ACTION_COPY.amountInvalid) };

  try {
    await mutate('/api/v1/bank/movements', {
      body: { direction, amount, idempotencyKey: clientKey || idempotencyKey() },
    });
    revalidatePath('/wallet');
    return {
      status: 'ok',
      message: pick(locale, direction === 'deposit' ? ACTION_COPY.deposited : ACTION_COPY.withdrawn),
    };
  } catch (error) {
    return failure(error, pick(locale, ACTION_COPY.bankRefused));
  }
}

export async function borrow(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const locale = await getServerLocale();
  const principalAmount = wholeAmount(formData.get('principalAmount'));
  const clientKey = String(formData.get('idempotencyKey') ?? '').trim();

  if (principalAmount === null) {
    return { status: 'error', message: pick(locale, ACTION_COPY.loanAmountInvalid) };
  }

  try {
    await mutate('/api/v1/bank/loans', {
      body: { principalAmount, idempotencyKey: clientKey || idempotencyKey() },
    });
    revalidatePath('/wallet');
    return { status: 'ok', message: pick(locale, ACTION_COPY.loanDone) };
  } catch (error) {
    return failure(error, pick(locale, ACTION_COPY.loanRefused));
  }
}

export async function repay(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const locale = await getServerLocale();
  const loanId = String(formData.get('loanId') ?? '');
  const amount = wholeAmount(formData.get('amount'));
  const clientKey = String(formData.get('idempotencyKey') ?? '').trim();

  if (!UUID.test(loanId)) return { status: 'error', message: pick(locale, ACTION_COPY.loanUnknown) };
  if (amount === null) return { status: 'error', message: pick(locale, ACTION_COPY.repayAmountInvalid) };

  try {
    await mutate(`/api/v1/bank/loans/${encodeURIComponent(loanId)}/repayments`, {
      body: { amount, idempotencyKey: clientKey || idempotencyKey() },
    });
    revalidatePath('/wallet');
    return { status: 'ok', message: pick(locale, ACTION_COPY.repayDone) };
  } catch (error) {
    return failure(error, pick(locale, ACTION_COPY.repayRefused));
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
  const locale = await getServerLocale();
  return claimReward('/api/v1/rewards/daily/claims', {
    already: pick(locale, ACTION_COPY.dailyAlready),
    granted: pick(locale, ACTION_COPY.dailyGranted),
  });
}
