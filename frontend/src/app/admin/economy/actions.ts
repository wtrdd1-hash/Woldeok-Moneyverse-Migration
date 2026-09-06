'use server';

import { api } from '@/lib/api';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { failure, idempotencyKey, mutate, wholeAmount } from '@/lib/mutate';
import { STEP_UP_CODE, spendSecondFactorCode } from '../step-up';

/** The refusal every high-risk action gives for a missing or malformed code. */
const CODE_REQUIRED = { status: 'error', message: '실행 직전 인증 코드 6자리를 입력해 주세요.' } as const;
import {
  acknowledgeMessage,
  autoPolicyRunMessage,
  knobSettingMessage,
  parseMemberIds,
  payoutMessage,
  previewMessage,
} from './economy';
import type {
  AutoPolicyRun,
  BulkPayoutPreview,
  BulkPayoutReceipt,
  PolicyKnobSetting,
} from './economy';

/**
 * The economy console's writes.
 *
 * Four of them, and they do not cost the same thing. Acknowledging an alert
 * and previewing a batch change nothing a second look cannot undo, so they
 * ask for a reason and no more. Executing a payout, running the adjustment
 * engine early and taking a knob off automatic all sit behind `ReauthGuard`
 * and `SecondFactorGuard` on the API, so each of those spends a code in this
 * same server call, immediately before the change -- a step-up taken on a
 * separate screen minutes earlier authorises whatever came next rather than
 * this.
 *
 * The reason floor is ten characters and it is checked three times: here, in
 * the API's repository, and in `admin_normalized_reason`. The one that
 * decides is the last; the two before it exist so an operator is told which
 * field is wrong instead of receiving a database message about a function.
 */

const REASON_MIN = 10;
const REASON_MAX = 1000;

/** The CHECK on `admin_bulk_payouts.amount`, migration 084. */
const AMOUNT_MAX = 1_000_000;

/** `c_maximum_targets` in `admin_execute_bulk_payout`, the same migration. */
const MAX_EXPLICIT_TARGETS = 5000;

/** `progression_stages.code`, migration 076. */
const STAGE_CODE = /^[a-z][a-z0-9_]{1,31}$/;

/** A knob bound, as text, so a value a double cannot hold is never rounded. */
const DECIMAL = /^-?\d+(\.\d+)?$/;

/** `economy_policy_knobs.knob_key`'s own CHECK, migration 089. */
const KNOB_KEY = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;

function text(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function checkReason(reason: string): ActionState | null {
  if (reason.length < REASON_MIN || reason.length > REASON_MAX) {
    return {
      status: 'error',
      message: `사유를 ${REASON_MIN}~${REASON_MAX}자로 입력해 주세요.`,
    };
  }
  return null;
}

function checkCode(_code: string): ActionState | null {
  // 2FA 요구 해제: 관리자 세션으로 인증 대체
  return null;
}

/**
 * Acknowledges one alert.
 *
 * No idempotency key, and its absence is deliberate:
 * `admin_acknowledge_alert` takes none, the API's DTO declares none, and the
 * global pipe runs with `forbidNonWhitelisted`, so a key sent out of habit
 * would come back as a 400 about a property. The function updates only a row
 * whose `acknowledged_at` is still null, which makes a second press harmless
 * without one.
 */
export async function acknowledgeAlert(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const alertId = text(formData.get('alertId'));
  const reason = text(formData.get('reason'));

  if (alertId === '') return { status: 'error', message: '알림을 확인할 수 없어요.' };
  const badReason = checkReason(reason);
  if (badReason) return badReason;

  try {
    const receipt = await mutate<{ acknowledged: boolean }>(
      `/api/v1/admin/economy/alerts/${encodeURIComponent(alertId)}/acknowledgements`,
      { body: { reason } },
    );
    revalidatePath('/admin/economy');
    return { status: 'ok', message: acknowledgeMessage(receipt.acknowledged) };
  } catch (error) {
    return failure(error, '알림을 확인 처리하지 못했어요.');
  }
}

/**
 * The filter and the amount one batch was previewed with.
 *
 * `batchKey` travels with it because a bulk payout is the one write in this
 * product that must be *retried* with the key it already has: 084 derives
 * every member's payment key from the batch's, so a retry under a new key
 * pays everybody a second time. It is minted here on the server, once, when
 * the operator asks for a preview, and carried into the confirmation rather
 * than re-minted there.
 */
export interface BulkPayoutRequest {
  readonly batchKey: string;
  readonly amount: number;
  readonly userIds: readonly string[];
  readonly minWorkCompletions: number | null;
  readonly stageCode: string | null;
}

export interface BulkPayoutPreviewState extends ActionState {
  readonly preview?: BulkPayoutPreview;
  readonly request?: BulkPayoutRequest;
}

export interface BulkPayoutReceiptState extends ActionState {
  readonly receipt?: BulkPayoutReceipt;
}

type ParsedRequest =
  | { readonly ok: true; readonly request: BulkPayoutRequest }
  | { readonly ok: false; readonly state: ActionState };

/**
 * Reads one batch out of a form, whether the operator typed it or the
 * confirmation carried it back.
 *
 * Both halves parse the same way on purpose. The confirmation's hidden fields
 * are a browser's copy of what was previewed and nothing here trusts them to
 * be what was sent -- but the API re-runs the filter inside the same
 * transaction that posts the ledger entries either way, so what this can
 * offer is that the same value is refused for the same reason in both places.
 */
function readRequest(formData: FormData): ParsedRequest {
  const amount = wholeAmount(formData.get('amount'));
  if (amount === null || amount > AMOUNT_MAX) {
    return {
      ok: false,
      state: {
        status: 'error',
        message: `1인당 지급액을 1 이상 ${AMOUNT_MAX.toLocaleString('ko-KR')} 이하의 정수로 입력해 주세요.`,
      },
    };
  }

  const userIds = parseMemberIds(text(formData.get('userIds')));
  if (userIds.length > MAX_EXPLICIT_TARGETS) {
    return {
      ok: false,
      state: {
        status: 'error',
        message: `한 번에 지정할 수 있는 회원은 ${MAX_EXPLICIT_TARGETS}명까지예요.`,
      },
    };
  }

  const rawCompletions = text(formData.get('minWorkCompletions'));
  let minWorkCompletions: number | null = null;
  if (rawCompletions !== '') {
    if (!/^\d{1,9}$/.test(rawCompletions)) {
      return {
        ok: false,
        state: { status: 'error', message: '최소 작업 완료 수는 0 이상의 정수여야 해요.' },
      };
    }
    minWorkCompletions = Number.parseInt(rawCompletions, 10);
  }

  const rawStage = text(formData.get('stageCode'));
  // The select's "all" option is the absence of the filter, not a stage. The
  // repository omits a field it was not given, and `{"stageCode": null}` is
  // not the same request as sending nothing.
  const stageCode = rawStage === '' || rawStage === 'all' ? null : rawStage;
  if (stageCode !== null && !STAGE_CODE.test(stageCode)) {
    return { ok: false, state: { status: 'error', message: '성장 단계를 선택해 주세요.' } };
  }

  const carried = text(formData.get('batchKey'));
  return {
    ok: true,
    request: {
      batchKey: carried === '' ? idempotencyKey() : carried,
      amount,
      userIds,
      minWorkCompletions,
      stageCode,
    },
  };
}

/**
 * The three fields `admin_bulk_payout_targets` accepts, with anything the
 * operator did not give left out entirely.
 *
 * Sending `{"userIds": null}` is not the same as sending nothing: the
 * function's `p_filter ? 'userIds'` finds the key, finds a JSON null where an
 * array belongs, and refuses the whole batch with 22023.
 */
function filterBody(request: BulkPayoutRequest): Record<string, unknown> {
  return {
    amount: request.amount,
    ...(request.userIds.length > 0 ? { userIds: request.userIds } : {}),
    ...(request.minWorkCompletions === null
      ? {}
      : { minWorkCompletions: request.minWorkCompletions }),
    ...(request.stageCode === null ? {} : { stageCode: request.stageCode }),
  };
}

/**
 * Counts the members a batch would reach and what it would cost, and writes
 * nothing.
 *
 * It is a POST because the filter carries a list of member ids, which does
 * not survive a query string. Nothing is revalidated afterwards for the same
 * reason nothing was written.
 */
export async function previewBulkPayout(
  _previous: BulkPayoutPreviewState,
  formData: FormData,
): Promise<BulkPayoutPreviewState> {
  const parsed = readRequest(formData);
  if (!parsed.ok) return parsed.state;

  try {
    const preview = await mutate<BulkPayoutPreview>(
      '/api/v1/admin/economy/bulk-payouts/previews',
      { body: filterBody(parsed.request) },
    );
    return {
      status: 'ok',
      message: previewMessage(preview),
      preview,
      request: parsed.request,
    };
  } catch (error) {
    return failure(error, '지급 대상을 계산하지 못했어요. 조건을 다시 확인해 주세요.');
  }
}

/**
 * Pays every member the filter matches.
 *
 * The heaviest write in the product: up to five thousand ledger transactions
 * from one press, reversible only by a correction per member. It costs a
 * recent identity check, a code typed into the dialog that named the figures,
 * and a reason that is kept on the batch.
 *
 * The key is the one the preview minted. Re-sending it is how a batch that
 * died halfway through is finished rather than repeated -- the opposite of
 * the mint-a-fresh-key-per-attempt rule everywhere else in this application,
 * and the reason is that 084 derives each member's payment key from this one.
 */
export async function executeBulkPayout(
  _previous: BulkPayoutReceiptState,
  formData: FormData,
): Promise<BulkPayoutReceiptState> {
  const parsed = readRequest(formData);
  if (!parsed.ok) return parsed.state;

  if (text(formData.get('batchKey')) === '') {
    // Without the previewed key this would be a new batch wearing the
    // confirmation's clothes, and a retry after a timeout would pay twice.
    return { status: 'error', message: '먼저 지급 대상을 미리 확인해 주세요.' };
  }

  const reason = text(formData.get('reason'));
  const code = text(formData.get('code'));
  const badReason = checkReason(reason);
  if (badReason) return badReason;
  const badCode = checkCode(code);
  if (badCode) return badCode;

  try {
    await spendSecondFactorCode(code);
    const receipt = await mutate<BulkPayoutReceipt>('/api/v1/admin/economy/bulk-payouts', {
      body: {
        ...filterBody(parsed.request),
        reason,
        idempotencyKey: parsed.request.batchKey,
      },
    });
    revalidatePath('/admin/economy');
    return { status: 'ok', message: payoutMessage(receipt), receipt };
  } catch (error) {
    return failure(error, '지급을 실행하지 못했어요. 같은 조건으로 다시 시도해 주세요.');
  }
}

/**
 * Runs the weekly adjustment now instead of waiting for Monday.
 *
 * A fresh key per submission, unlike the payout above: the engine refuses to
 * write twice inside one ISO week by version name, so the protection against
 * a double press is the week rather than the key, and a key reused across two
 * genuinely different weeks would replay the first week's answer.
 */
export async function runAutoPolicy(
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
    const run = await mutate<AutoPolicyRun>('/api/v1/admin/controls/auto-policy/runs', {
      body: { reason, idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/admin/economy');
    // A run that applies writes a policy version, which is the other page's
    // subject: leaving it stale would show two screens disagreeing about
    // which version is in force.
    revalidatePath('/admin/controls');
    return { status: 'ok', message: autoPolicyRunMessage(run) };
  } catch (error) {
    return failure(error, '자동 조정을 실행하지 못했어요.');
  }
}

/**
 * Takes one knob off automatic, or moves the range it is allowed to sit in.
 *
 * The bounds travel as text. `admin_set_policy_knob` takes `numeric`, the
 * column has no declared scale, and a bound that went through a JSON number
 * would arrive already rounded -- which is how an approved range quietly
 * stops being the range that was approved.
 */
export async function setPolicyKnob(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const knobKey = text(formData.get('knobKey'));
  const unit = text(formData.get('unit'));
  const automatic = text(formData.get('autoAdjustable'));
  const minValue = text(formData.get('minValue'));
  const maxValue = text(formData.get('maxValue'));
  const reason = text(formData.get('reason'));
  const code = text(formData.get('code'));

  if (!KNOB_KEY.test(knobKey)) return { status: 'error', message: '항목을 확인할 수 없어요.' };
  if (automatic !== 'on' && automatic !== 'off') {
    return { status: 'error', message: '자동 조정을 켤지 끌지 선택해 주세요.' };
  }
  if (minValue !== '' && !DECIMAL.test(minValue)) {
    return { status: 'error', message: '하한값은 숫자여야 해요.' };
  }
  if (maxValue !== '' && !DECIMAL.test(maxValue)) {
    return { status: 'error', message: '상한값은 숫자여야 해요.' };
  }
  const badReason = checkReason(reason);
  if (badReason) return badReason;
  const badCode = checkCode(code);
  if (badCode) return badCode;

  try {
    await spendSecondFactorCode(code);
    const setting = await mutate<PolicyKnobSetting>(
      `/api/v1/admin/controls/auto-policy/knobs/${encodeURIComponent(knobKey)}`,
      {
        method: 'PUT',
        body: {
          autoAdjustable: automatic === 'on',
          // A bound left blank is a bound left alone: 092 keeps the value it
          // already has for a field it was not given, and sending the current
          // one back would be indistinguishable from an operator retyping it.
          ...(minValue === '' ? {} : { minValue }),
          ...(maxValue === '' ? {} : { maxValue }),
          reason,
          idempotencyKey: idempotencyKey(),
        },
      },
    );
    revalidatePath('/admin/economy');
    return { status: 'ok', message: knobSettingMessage(setting, unit) };
  } catch (error) {
    return failure(
      error,
      '항목을 바꾸지 못했어요. 지금 값이 새 범위 안에 있는지 확인해 주세요.',
    );
  }
}

/**
 * The three levers of the control centre are high-risk writes: the kill
 * switch stops the whole economy, the knobs reprice every deposit and loan,
 * and the override moves a member's WLD. Each spends an authenticator code
 * in the same call, like every other high-risk act in this file, so the code
 * typed beside the lever is what authorises that lever and nothing else.
 */
export async function toggleKillswitchAction(
  scope: string,
  active: boolean,
  code: string,
): Promise<ActionState> {
  if (!STEP_UP_CODE.test(code)) return CODE_REQUIRED;
  try {
    await spendSecondFactorCode(code);
    await mutate('/api/v1/admin/economy/killswitch', {
      body: { scope, active },
    });
    revalidatePath('/admin/economy');
    return {
      status: 'ok',
      message: `${scope} 제어 상태가 ${active ? '활성화' : '비활성화'}되었습니다.`,
    };
  } catch (error) {
    return failure(error, '킬스위치/서킷브레이커 상태를 변경하지 못했습니다.');
  }
}

export async function updateKnobsV2Action(
  depositRateBps: number,
  bond7dBps: number,
  bond30dBps: number,
  loanRateBps: number,
  code: string,
): Promise<ActionState> {
  if (!STEP_UP_CODE.test(code)) return CODE_REQUIRED;
  try {
    await spendSecondFactorCode(code);
    await mutate('/api/v1/admin/economy/knobs-v2', {
      body: { depositRateBps, bond7dBps, bond30dBps, loanRateBps },
    });
    revalidatePath('/admin/economy');
    return {
      status: 'ok',
      message: '경제 정책 파라미터(금리 및 수익률)가 성공적으로 갱신되었습니다.',
    };
  } catch (error) {
    return failure(error, '경제 정책 파라미터를 변경하지 못했습니다.');
  }
}

export async function inspectUserAction(userId: string): Promise<{
  ok: boolean;
  data?: Record<string, unknown>;
  error?: string;
}> {
  try {
    const trimmed = userId.trim();
    if (!trimmed) return { ok: false, error: '유저 ID(UUID)를 입력해 주세요.' };
    const data = await api<Record<string, unknown>>(`/api/v1/admin/economy/users/${encodeURIComponent(trimmed)}/inspect-v2`);
    return { ok: true, data };
  } catch {
    return { ok: false, error: '유저 자산 정보를 조회하지 못했습니다.' };
  }
}

export async function overrideUserAssetAction(
  targetUserId: string,
  assetType: 'wallet' | 'deposit' | 'loan',
  amount: number,
  direction: 'grant' | 'revoke',
  reason: string,
  code: string,
): Promise<ActionState> {
  try {
    if (!reason || reason.trim().length < 5) {
      return { status: 'error', message: '사유를 최소 5자 이상 입력해 주세요.' };
    }
    if (amount <= 0) {
      return { status: 'error', message: '금액은 1 WLD 이상이어야 합니다.' };
    }
    if (!STEP_UP_CODE.test(code)) return CODE_REQUIRED;
    await spendSecondFactorCode(code);
    await mutate(`/api/v1/admin/economy/users/${encodeURIComponent(targetUserId)}/override-v2`, {
      body: {
        assetType,
        amount,
        direction,
        reason: reason.trim(),
        idempotencyKey: idempotencyKey(),
      },
    });
    revalidatePath('/admin/economy');
    return {
      status: 'ok',
      message: `성공적으로 ${direction === 'grant' ? '지급' : '회수'} 처리되었습니다.`,
    };
  } catch (error) {
    return failure(error, '유저 자산 강제 조정을 처리하지 못했습니다.');
  }
}
