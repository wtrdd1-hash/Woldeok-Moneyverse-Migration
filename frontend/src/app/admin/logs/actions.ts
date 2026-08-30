'use server';

import { revalidatePath } from 'next/cache';
import { ApiError } from '@/lib/api';
import type { ActionState } from '@/lib/action-state';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';
import { STEP_UP_CODE, spendSecondFactorCode } from '../step-up';
import type { AuditRevealedEvent, ChainVerification } from '../types';

/**
 * The audit trail's four writes.
 *
 * Three of them do not change anything an operator can see: revealing an
 * entry, verifying the chain and recording a disposition all only add rows.
 * They are still writes, and they are still behind the console's step-up,
 * because what they produce *is* the evidence — an unmasked address that was
 * read without a recorded reason, or a verification nobody can attribute, is
 * worth less than not having asked.
 *
 * Verification is the exception on the code: the API guards it with CSRF
 * alone, since recomputing hashes over a window neither discloses a masked
 * value nor changes a retention promise. Asking for a code there would train
 * an operator to type one for a read.
 */

const REASON_MIN = 10;
const REASON_MAX = 1000;
/** A chain position, as text. 18 digits is what the DTO accepts as a bigint. */
const SEQUENCE = /^\d{1,18}$/;

function text(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function checkReason(reason: string): ActionState | null {
  if (reason.length < REASON_MIN || reason.length > REASON_MAX) {
    return { status: 'error', message: `사유를 ${REASON_MIN}~${REASON_MAX}자로 입력해 주세요.` };
  }
  return null;
}

function checkCode(code: string): ActionState | null {
  if (!STEP_UP_CODE.test(code)) {
    return { status: 'error', message: '실행 직전 인증 코드 6자리를 입력해 주세요.' };
  }
  return null;
}

/**
 * A 401 here is the step-up refusing, not the session expiring: these routes
 * sit behind `ReauthGuard` and `SecondFactorGuard`, which answer 401 for a
 * stale reauthentication or a code that has already been spent. `failure`
 * reads 401 as "sign in", which would send an operator who is signed in to
 * the login page looking for a problem that is not there.
 */
function stepUpFailure(error: unknown, fallback: string): ActionState {
  if (error instanceof ApiError && error.status === 401) {
    return {
      status: 'error',
      message:
        '최근 본인 확인과 인증 앱 코드가 필요해요. 내 계정에서 본인 확인을 마친 뒤 새 코드로 다시 시도해 주세요.',
    };
  }
  return failure(error, fallback);
}

export interface RevealState extends ActionState {
  readonly revealed?: AuditRevealedEvent;
}

/**
 * Unmasks one entry, and says so.
 *
 * The database writes its own audit row for this before it returns anything,
 * so the reason is not a formality — it is the sentence the next reader of
 * the trail will find beside the fact that somebody looked.
 */
export async function revealAuditEvent(
  _previous: RevealState,
  formData: FormData,
): Promise<RevealState> {
  const auditId = text(formData.get('auditId'));
  const reason = text(formData.get('reason'));
  const code = text(formData.get('code'));

  if (auditId === '') return { status: 'error', message: '대상 기록을 확인할 수 없어요.' };
  const badReason = checkReason(reason);
  if (badReason) return badReason;
  const badCode = checkCode(code);
  if (badCode) return badCode;

  try {
    await spendSecondFactorCode(code);
    const revealed = await mutate<AuditRevealedEvent>(
      `/api/v1/admin/audit/events/${encodeURIComponent(auditId)}/reveal`,
      { body: { reason } },
    );
    revalidatePath('/admin/logs');
    return { status: 'ok', message: '원본을 표시했고, 이 열람도 기록에 남았습니다.', revealed };
  } catch (error) {
    return stepUpFailure(error, '원본을 표시하지 못했어요.');
  }
}

export interface VerifyState extends ActionState {
  readonly result?: ChainVerification;
}

export async function verifyAuditChain(
  _previous: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const fromSequence = text(formData.get('fromSequence'));
  const toSequence = text(formData.get('toSequence'));

  if (fromSequence !== '' && !SEQUENCE.test(fromSequence)) {
    return { status: 'error', message: '시작 순번을 숫자로 입력해 주세요.' };
  }
  if (toSequence !== '' && !SEQUENCE.test(toSequence)) {
    return { status: 'error', message: '끝 순번을 숫자로 입력해 주세요.' };
  }

  try {
    const result = await mutate<ChainVerification>('/api/v1/admin/audit/verify', {
      body: {
        ...(fromSequence === '' ? {} : { fromSequence }),
        ...(toSequence === '' ? {} : { toSequence }),
      },
    });
    revalidatePath('/admin/logs/integrity');
    return {
      status: result.status === 'failed' ? 'error' : 'ok',
      message:
        result.status === 'failed'
          ? `${result.checked_count}건 중 문제가 있는 행을 찾았습니다. 아래 내역을 확인해 주세요.`
          : result.status === 'empty'
            ? '지정한 구간에 검증할 기록이 없습니다.'
            : `${result.checked_count}건을 검증했고 모두 사슬과 일치했습니다.`,
      result,
    };
  } catch (error) {
    // 100000 rows is the API's own ceiling, and it is the only 400 an
    // operator can hit by asking a reasonable question.
    return failure(error, '검증할 구간이 너무 넓어요. 10만 행 이내로 좁혀 주세요.');
  }
}

export async function setAuditRetention(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const category = text(formData.get('category'));
  const days = text(formData.get('retentionDays'));
  const legalBasis = text(formData.get('legalBasis'));
  const description = text(formData.get('description'));
  const effectiveAt = text(formData.get('effectiveAt'));
  const reason = text(formData.get('reason'));
  const code = text(formData.get('code'));

  if (category === '') return { status: 'error', message: '대상 구분을 확인할 수 없어요.' };
  const retentionDays = /^\d{1,4}$/.test(days) ? Number(days) : 0;
  if (retentionDays < 1 || retentionDays > 3650) {
    return { status: 'error', message: '보존 기간을 1~3650일 사이로 입력해 주세요.' };
  }
  if (legalBasis === '' || legalBasis.length > 500) {
    return { status: 'error', message: '법적 근거를 500자 이내로 입력해 주세요.' };
  }
  if (description === '' || description.length > 1000) {
    return { status: 'error', message: '설명을 1000자 이내로 입력해 주세요.' };
  }
  const badReason = checkReason(reason);
  if (badReason) return badReason;
  const badCode = checkCode(code);
  if (badCode) return badCode;

  // Empty means now. `datetime-local` has no zone, so it is read in the
  // operator's own zone rather than silently as UTC.
  let effectiveAtIso: string | undefined;
  if (effectiveAt !== '') {
    const parsed = new Date(effectiveAt);
    if (Number.isNaN(parsed.getTime())) {
      return { status: 'error', message: '적용 시각을 다시 확인해 주세요.' };
    }
    effectiveAtIso = parsed.toISOString();
  }

  try {
    await spendSecondFactorCode(code);
    await mutate(`/api/v1/admin/audit/retention/${encodeURIComponent(category)}`, {
      method: 'PUT',
      body: {
        retentionDays,
        legalBasis,
        description,
        reason,
        idempotencyKey: idempotencyKey(),
        ...(effectiveAtIso === undefined ? {} : { effectiveAt: effectiveAtIso }),
      },
    });
    revalidatePath('/admin/logs/integrity');
    return {
      status: 'ok',
      message: `${category} 보존 기간을 ${retentionDays}일로 하는 새 버전을 추가했어요. 공개된 처리방침도 함께 맞춰 주세요.`,
    };
  } catch (error) {
    return stepUpFailure(error, '보존 정책을 바꾸지 못했어요.');
  }
}

export async function recordAuditDisposition(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const category = text(formData.get('category'));
  const fromSequence = text(formData.get('fromSequence'));
  const toSequence = text(formData.get('toSequence'));
  const method = text(formData.get('method'));
  const note = text(formData.get('note'));
  const reason = text(formData.get('reason'));
  const code = text(formData.get('code'));

  if (category === '') return { status: 'error', message: '대상 구분을 선택해 주세요.' };
  if (!SEQUENCE.test(fromSequence) || !SEQUENCE.test(toSequence)) {
    return { status: 'error', message: '시작과 끝 순번을 숫자로 입력해 주세요.' };
  }
  if (!['archived', 'destroyed', 'retained_on_hold'].includes(method)) {
    return { status: 'error', message: '처리 방법을 선택해 주세요.' };
  }
  if (note.length > 1000) {
    return { status: 'error', message: '비고를 1000자 이내로 입력해 주세요.' };
  }
  const badReason = checkReason(reason);
  if (badReason) return badReason;
  const badCode = checkCode(code);
  if (badCode) return badCode;

  try {
    await spendSecondFactorCode(code);
    const record = await mutate<{ row_count: string }>('/api/v1/admin/audit/dispositions', {
      body: {
        category,
        fromSequence,
        toSequence,
        method,
        note,
        reason,
        idempotencyKey: idempotencyKey(),
      },
    });
    revalidatePath('/admin/logs/integrity');
    return { status: 'ok', message: `${record.row_count}건에 대한 처리를 기록했어요.` };
  } catch (error) {
    return stepUpFailure(error, '처리 기록을 남기지 못했어요.');
  }
}
