'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionState } from '@/lib/action-state';
import { api, apiWithCookie } from '@/lib/api';
import { relaySetCookie } from '@/lib/cookie-relay';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';
import { consoleReturnPath } from './areas';
import { STEP_UP_CODE, spendSecondFactorCode } from './step-up';
import { ADMIN_BLOCK_UUID, parseAdminIpBlocks } from './security/security-evidence';

/**
 * Getting into the operations console, and the second factor that costs.
 *
 * Two of these cannot go through `mutate()`. Opening the console rotates the
 * session — the API issues a new cookie and revokes the old one — so the
 * `set-cookie` it returns has to be relayed to the browser rather than
 * dropped, which is what `apiWithCookie` is for. Everything else is an
 * ordinary audited write.
 *
 * The Korean sentences here are what an operator reads when something is
 * refused. They say which of the three things is missing — a code, a recent
 * sign-in, or an address the deployment recognises — because "권한이 없어요"
 * is true of all three and useful for none of them.
 */

function text(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Fetches and spends a CSRF token in one call, exactly as `mutate` does. */
async function csrfToken(): Promise<string> {
  const { csrfToken: token } = await api<{ csrfToken: string }>('/api/v1/auth/session');
  return token;
}

export async function openConsole(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // The page the gate turned away, if any. Checked, not trusted: it came
  // from a form field.
  const next = consoleReturnPath(formData.get('next'));

  try {
    const { setCookie } = await apiWithCookie<unknown>('/api/v1/admin/security/sessions', {
      method: 'POST',
      csrfToken: await csrfToken(),
    });
    await relaySetCookie(setCookie);
    revalidatePath('/admin');
  } catch (error) {
    return failure(
      error,
      '콘솔을 열지 못했어요. 관리자 권한과 허용된 접속 주소를 확인해 주세요.',
    );
  }

  // Outside the try: redirect() works by throwing, and a catch above would
  // report a successful open as a failure to open.
  if (next) redirect(next);
  return {
    status: 'ok',
    message: '운영 콘솔을 열었어요. 세션은 최대 30일 유지되며, 24시간 사용하지 않으면 잠깁니다.',
  };
}

export async function closeConsole(
  _previous: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  try {
    const { setCookie } = await apiWithCookie<unknown>('/api/v1/admin/security/sessions', {
      method: 'DELETE',
      csrfToken: await csrfToken(),
    });
    await relaySetCookie(setCookie);
    revalidatePath('/admin');
    return { status: 'ok', message: '콘솔을 닫았어요. 다시 로그인해 주세요.' };
  } catch (error) {
    return failure(error, '콘솔을 닫지 못했어요.');
  }
}

export async function forceLogout(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = text(formData.get('userId'));
  const reason = text(formData.get('reason'));
  const code = text(formData.get('code'));

  if (userId === '') return { status: 'error', message: '대상 사용자를 확인할 수 없어요.' };
  if (reason.length < 10 || reason.length > 1000) {
    return { status: 'error', message: '사유를 10~1000자로 입력해 주세요.' };
  }
  if (!STEP_UP_CODE.test(code)) {
    return { status: 'error', message: '실행 직전 인증 코드 6자리를 입력해 주세요.' };
  }

  try {
    await spendSecondFactorCode(code);
    const result = await mutate<{ revokedSessions: number }>(
      '/api/v1/admin/security/forced-logouts',
      { body: { userId, reason, idempotencyKey: idempotencyKey() } },
    );
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${encodeURIComponent(userId)}`);
    return { status: 'ok', message: `세션 ${result.revokedSessions}개를 끊었어요.` };
  } catch (error) {
    return failure(error, '세션을 끊지 못했어요.');
  }
}

export async function permanentlySuspendUser(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = text(formData.get('userId'));
  const reason = text(formData.get('reason'));
  const code = text(formData.get('code'));
  if (userId === '') return { status: 'error', message: '대상 사용자를 확인할 수 없어요.' };
  if (reason.length < 3 || reason.length > 1000) return { status: 'error', message: '사유를 3~1000자로 입력해 주세요.' };
  if (!STEP_UP_CODE.test(code)) return { status: 'error', message: '실행 직전 인증 코드 6자리를 입력해 주세요.' };
  try {
    await spendSecondFactorCode(code);
    await mutate(`/api/v1/admin/security/users/${encodeURIComponent(userId)}/permanent-suspension`, {
      body: { reason },
    });
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${encodeURIComponent(userId)}`);
    return { status: 'ok', message: '계정을 영구 정지하고 모든 로그인 세션을 종료했습니다.' };
  } catch (error) {
    return failure(error, '계정을 영구 정지하지 못했어요.');
  }
}

export async function blockIpAddress(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const network = text(formData.get('network'));
  const reason = text(formData.get('reason'));
  const code = text(formData.get('code'));
  if (!/^[0-9A-Fa-f:.]+(?:\/\d{1,3})?$/.test(network)) return { status: 'error', message: 'IP 또는 CIDR 형식을 확인해 주세요.' };
  if (reason.length < 3 || reason.length > 1000) return { status: 'error', message: '사유를 3~1000자로 입력해 주세요.' };
  if (!STEP_UP_CODE.test(code)) return { status: 'error', message: '실행 직전 인증 코드 6자리를 입력해 주세요.' };
  try {
    await spendSecondFactorCode(code);
    const receipt = await mutate<{ block_id: string; network: string; expires_at: string | null }>('/api/v1/admin/security/ip-blocks', {
      body: { network, reason, idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/admin/security');
    if (!receipt || typeof receipt.block_id !== 'string' || !ADMIN_BLOCK_UUID.test(receipt.block_id)) {
      return { status: 'error', message: '차단 접수 결과를 확인하지 못했습니다. 중복 실행하지 말고 기록을 다시 조회해 주세요.' };
    }
    try {
      const verified = parseAdminIpBlocks(await api<unknown>('/api/v1/admin/security/ip-blocks'));
      if (!verified?.some((item) => item.block_id === receipt.block_id && item.active)) {
        return { status: 'error', message: '차단 후 실제 상태를 확인하지 못했습니다. 중복 실행하지 말고 기록을 다시 조회해 주세요.' };
      }
    } catch {
      return { status: 'error', message: '차단 요청 후 재조회가 실패했습니다. 중복 실행하지 말고 기록을 다시 조회해 주세요.' };
    }
    return { status: 'ok', message: `${network} 차단이 기록에서 확인됐습니다.` };
  } catch (error) {
    return failure(error, 'IP 차단을 적용하지 못했어요.');
  }
}

export async function liftIpAddressBlock(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const blockId = text(formData.get('blockId'));
  const reason = text(formData.get('reason'));
  const code = text(formData.get('code'));
  if (!ADMIN_BLOCK_UUID.test(blockId)) return { status: 'error', message: '차단 기록을 확인할 수 없어요.' };
  if (reason.length < 3 || reason.length > 1000) return { status: 'error', message: '해제 사유를 3~1000자로 입력해 주세요.' };
  if (!STEP_UP_CODE.test(code)) return { status: 'error', message: '실행 직전 인증 코드 6자리를 입력해 주세요.' };
  try {
    await spendSecondFactorCode(code);
    const receipt = await mutate<{ block_id: string; lifted: boolean }>(`/api/v1/admin/security/ip-blocks/${encodeURIComponent(blockId)}`, {
      method: 'DELETE',
      body: { reason, idempotencyKey: idempotencyKey() },
    });
    revalidatePath('/admin/security');
    if (!receipt || receipt.block_id !== blockId || receipt.lifted !== true) {
      return { status: 'error', message: '차단 해제 영수증을 확인하지 못했습니다. 중복 실행하지 말고 기록을 다시 조회해 주세요.' };
    }
    try {
      const verified = parseAdminIpBlocks(await api<unknown>('/api/v1/admin/security/ip-blocks'));
      if (!verified?.some((item) => item.block_id === blockId && !item.active && item.lifted_at !== null)) {
        return { status: 'error', message: '차단 해제 후 실제 상태를 확인하지 못했습니다. 중복 실행하지 말고 기록을 다시 조회해 주세요.' };
      }
    } catch {
      return { status: 'error', message: '차단 해제 후 재조회가 실패했습니다. 중복 실행하지 말고 기록을 다시 조회해 주세요.' };
    }
    return { status: 'ok', message: 'IP 차단 해제가 기록에서 확인됐습니다.' };
  } catch (error) {
    return failure(error, 'IP 차단을 해제하지 못했어요.');
  }
}
