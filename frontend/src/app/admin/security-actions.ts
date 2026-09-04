'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionState } from '@/lib/action-state';
import { api, apiWithCookie } from '@/lib/api';
import { relaySetCookie } from '@/lib/cookie-relay';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';
import { consoleReturnPath } from './areas';
import { STEP_UP_CODE, spendSecondFactorCode } from './step-up';

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

export async function beginSecondFactorEnrolment(
  _previous: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  try {
    const enrolment = await mutate<{ otpauthUri: string; secret: string }>(
      '/api/v1/admin/security/second-factor',
    );
    revalidatePath('/admin');
    // The secret travels back in the message because this is the only moment
    // it exists in the clear: the database has the sealed form and nothing
    // can produce this string again.
    return {
      status: 'ok',
      message: `인증 앱에 이 키를 등록해 주세요: ${enrolment.secret}`,
    };
  } catch (error) {
    return failure(error, '2단계 인증 등록을 시작하지 못했어요. 먼저 본인 확인을 해 주세요.');
  }
}

export async function confirmSecondFactorEnrolment(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const code = text(formData.get('code'));
  if (!STEP_UP_CODE.test(code)) {
    return { status: 'error', message: '인증 앱에 표시된 6자리 숫자를 입력해 주세요.' };
  }

  try {
    await mutate('/api/v1/admin/security/second-factor', { method: 'PUT', body: { code } });
    revalidatePath('/admin');
    return { status: 'ok', message: '2단계 인증을 등록했어요.' };
  } catch (error) {
    return failure(error, '코드가 맞지 않아요. 앱의 시간이 맞는지 확인해 주세요.');
  }
}

export async function openConsole(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const code = text(formData.get('code'));
  if (!STEP_UP_CODE.test(code)) {
    return { status: 'error', message: '인증 앱에 표시된 6자리 숫자를 입력해 주세요.' };
  }

  // The page the gate turned away, if any. Checked, not trusted: it came
  // from a form field.
  const next = consoleReturnPath(formData.get('next'));

  try {
    await spendSecondFactorCode(code);
    const { setCookie } = await apiWithCookie<unknown>('/api/v1/admin/security/sessions', {
      method: 'POST',
      csrfToken: await csrfToken(),
    });
    await relaySetCookie(setCookie);
    revalidatePath('/admin');
  } catch (error) {
    return failure(
      error,
      '콘솔을 열지 못했어요. 본인 확인이 최근 5분 안에 끝났는지, 허용된 주소인지 확인해 주세요.',
    );
  }

  // Outside the try: redirect() works by throwing, and a catch above would
  // report a successful open as a failure to open.
  if (next) redirect(next);
  return {
    status: 'ok',
    message: '운영 콘솔을 열었어요. 30분 뒤, 또는 10분간 조작이 없으면 잠깁니다.',
  };
}

export async function openConsoleWithRecoveryCode(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const code = text(formData.get('code'));
  if (!/^[A-Za-z0-9_-]{27}$/.test(code)) {
    return { status: 'error', message: '발급받은 복구 코드 형식을 확인해 주세요.' };
  }
  const next = consoleReturnPath(formData.get('next'));
  try {
    const { setCookie } = await apiWithCookie<unknown>('/api/v1/admin/security/recovery-sessions', {
      method: 'POST',
      csrfToken: await csrfToken(),
      body: { code },
    });
    await relaySetCookie(setCookie);
    revalidatePath('/admin');
  } catch (error) {
    return failure(
      error,
      '복구 코드가 올바르지 않거나 잠겨 있어요. 최근 본인 확인도 확인해 주세요.',
    );
  }
  if (next) redirect(next);
  return {
    status: 'ok',
    message: '복구 코드를 사용해 운영 콘솔을 열었어요. 이 코드는 폐기됐습니다.',
  };
}

export async function issueRecoveryCodes(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const code = text(formData.get('code'));
  if (!STEP_UP_CODE.test(code)) {
    return { status: 'error', message: '발급 직전 인증 앱 코드 6자리를 입력해 주세요.' };
  }
  try {
    await spendSecondFactorCode(code);
    const issued = await mutate<{ codes: string[]; expiresAt: string }>(
      '/api/v1/admin/security/recovery-codes',
    );
    return {
      status: 'ok',
      message: `지금 안전한 곳에 보관하세요. 다시 표시되지 않습니다.\n${issued.codes.join('\n')}`,
    };
  } catch (error) {
    return failure(
      error,
      '복구 코드를 발급하지 못했어요. 최근 본인 확인과 인증 앱 코드를 확인해 주세요.',
    );
  }
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
