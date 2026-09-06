'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';
import { STEP_UP_CODE, spendSecondFactorCode } from '../step-up';

/**
 * The control plane's writes: feature switches, economy policy versions, and
 * administrative roles.
 *
 * Each of these was a two-person decision until migrations 057-058 retired
 * that rule, so each of them now costs a code the operator types into the
 * dialog that named what is about to change. The code is spent here, in the
 * same server action, immediately before the change — a step-up on its own
 * page, minutes earlier, would authorise whatever came next rather than this.
 *
 * The reason floor is 10 characters and it is checked three times: here, in
 * `controls.repository.ts`, and in `admin_normalized_reason`. The one that
 * decides is the last; the two before it exist so an operator is told which
 * field is wrong instead of receiving a database message.
 */

const REASON_MIN = 10;
const REASON_MAX = 1000;

function text(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function checkReason(reason: string): ActionState | null {
  if (reason.length < REASON_MIN || reason.length > REASON_MAX) {
    return { status: 'error', message: `변경 사유를 ${REASON_MIN}~${REASON_MAX}자로 입력해 주세요.` };
  }
  return null;
}

function checkCode(code: string): ActionState | null {
  if (!STEP_UP_CODE.test(code)) {
    return { status: 'error', message: '실행 직전 인증 코드 6자리를 입력해 주세요.' };
  }
  return null;
}

export async function setFeatureSwitch(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const featureKey = text(formData.get('featureKey'));
  const state = text(formData.get('state'));
  const reason = text(formData.get('reason'));
  const code = text(formData.get('code'));
  const requiresCode = featureKey !== 'economy_auto_policy';

  if (featureKey === '') return { status: 'error', message: '기능을 확인할 수 없어요.' };
  if (!['enabled', 'paused', 'safe_mode', 'disabled'].includes(state)) {
    return { status: 'error', message: '바꿀 상태를 선택해 주세요.' };
  }
  const badReason = checkReason(reason);
  if (badReason) return badReason;
  if (requiresCode) {
    const badCode = checkCode(code);
    if (badCode) return badCode;
  }

  try {
    if (requiresCode) await spendSecondFactorCode(code);
    const result = await mutate<{ previousState: string; nextState: string }>(
      `/api/v1/admin/controls/feature-switches/${encodeURIComponent(featureKey)}`,
      { method: 'PUT', body: { state, reason, idempotencyKey: idempotencyKey() } },
    );
    revalidatePath('/admin/controls');
    return {
      status: 'ok',
      message: `${featureKey}: ${result.previousState} → ${result.nextState}`,
    };
  } catch (error) {
    return failure(error, '기능 상태를 바꾸지 못했어요.');
  }
}

export async function createPolicyVersion(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const version = text(formData.get('version'));
  const effectiveAt = text(formData.get('effectiveAt'));
  const rawPayload = text(formData.get('payload'));
  const reason = text(formData.get('reason'));
  const code = text(formData.get('code'));

  if (version.length < 3 || version.length > 64) {
    return { status: 'error', message: '버전 이름을 3~64자로 입력해 주세요.' };
  }

  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = rawPayload === '' ? {} : JSON.parse(rawPayload);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { status: 'error', message: '정책 내용은 JSON 객체여야 해요.' };
    }
    payload = parsed as Record<string, unknown>;
  } catch {
    return { status: 'error', message: '정책 내용의 JSON 형식을 확인해 주세요.' };
  }

  const badReason = checkReason(reason);
  if (badReason) return badReason;
  const badCode = checkCode(code);
  if (badCode) return badCode;

  // An empty field means now. `datetime-local` gives a value with no zone, so
  // it is read in the operator's own zone rather than silently as UTC.
  let effectiveAtIso: string | undefined;
  if (effectiveAt !== '') {
    const parsed = new Date(effectiveAt);
    if (Number.isNaN(parsed.getTime())) {
      return { status: 'error', message: '발효 시각을 다시 확인해 주세요.' };
    }
    effectiveAtIso = parsed.toISOString();
  }

  try {
    await spendSecondFactorCode(code);
    const result = await mutate<{ version: string; status: string }>(
      '/api/v1/admin/controls/policies',
      {
        body: {
          version,
          payload,
          reason,
          idempotencyKey: idempotencyKey(),
          ...(effectiveAtIso === undefined ? {} : { effectiveAt: effectiveAtIso }),
        },
      },
    );
    revalidatePath('/admin/controls');
    return { status: 'ok', message: `${result.version} 버전을 만들었어요 (${result.status}).` };
  } catch (error) {
    return failure(error, '정책 버전을 만들지 못했어요. 같은 이름이 이미 있는지 확인해 주세요.');
  }
}

export async function rollbackPolicy(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const reason = text(formData.get('reason'));
  const code = text(formData.get('code'));

  const badReason = checkReason(reason);
  if (badReason) return badReason;
  const badCode = checkCode(code);
  if (badCode) return badCode;

  try {
    await spendSecondFactorCode(code);
    const result = await mutate<{ rolledBackVersion: string; restoredVersion: string }>(
      '/api/v1/admin/controls/policies/rollbacks',
      { body: { reason, idempotencyKey: idempotencyKey() } },
    );
    revalidatePath('/admin/controls');
    return {
      status: 'ok',
      message: `${result.rolledBackVersion}을(를) 되돌리고 ${result.restoredVersion}을(를) 다시 적용했어요.`,
    };
  } catch (error) {
    return failure(error, '되돌릴 이전 버전이 없어요.');
  }
}

export async function activateDuePolicies(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const code = text(formData.get('code'));
  const badCode = checkCode(code);
  if (badCode) return badCode;

  try {
    await spendSecondFactorCode(code);
    const result = await mutate<{ activated: number }>(
      '/api/v1/admin/controls/policies/activations',
      { body: {} },
    );
    revalidatePath('/admin/controls');
    return { status: 'ok', message: `${result.activated}개 버전을 발효했어요.` };
  } catch (error) {
    return failure(error, '발효할 버전이 없어요.');
  }
}

export async function grantRole(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return designateRole(formData, 'grant');
}

export async function revokeRole(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return designateRole(formData, 'revoke');
}

/**
 * Granting and revoking differ only in the path and the sentence. Sharing the
 * body keeps the two from drifting apart on validation, which is where the
 * difference would matter and be hardest to see.
 */
async function designateRole(
  formData: FormData,
  operation: 'grant' | 'revoke',
): Promise<ActionState> {
  const userId = text(formData.get('userId'));
  const role = text(formData.get('role'));
  const reason = text(formData.get('reason'));
  const code = text(formData.get('code'));

  if (userId === '') return { status: 'error', message: '대상 사용자를 확인할 수 없어요.' };
  if (!['operator', 'approver', 'superadmin'].includes(role)) {
    return { status: 'error', message: '역할을 선택해 주세요.' };
  }
  if (operation === 'revoke' && role === 'superadmin') {
    return {
      status: 'error',
      message: '최고관리자는 회수할 수 없어요. 다른 계정에 넘겨 주세요.',
    };
  }
  const badReason = checkReason(reason);
  if (badReason) return badReason;
  const badCode = checkCode(code);
  if (badCode) return badCode;

  try {
    await spendSecondFactorCode(code);
    await mutate(
      operation === 'grant'
        ? '/api/v1/admin/controls/roles'
        : '/api/v1/admin/controls/role-revocations',
      { body: { userId, role, reason, idempotencyKey: idempotencyKey() } },
    );
    revalidatePath('/admin/controls');
    return {
      status: 'ok',
      message: operation === 'grant' ? '역할을 부여했어요.' : '역할을 회수했어요.',
    };
  } catch (error) {
    return failure(
      error,
      operation === 'grant' ? '역할을 부여하지 못했어요.' : '역할을 회수하지 못했어요.',
    );
  }
}
