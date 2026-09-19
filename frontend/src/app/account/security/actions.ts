'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { api, apiWithCookie } from '@/lib/api';
import { relaySetCookie } from '@/lib/cookie-relay';
import { mutate } from '@/lib/mutate';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PROVIDERS = new Set(['discord', 'google']);

export async function terminateSession(formData: FormData): Promise<void> {
  const sessionId = String(formData.get('sessionId') ?? '');
  if (!UUID.test(sessionId)) redirect('/account/security?error=invalid-session');

  let revoked = false;
  try {
    ({ revoked } = await mutate<{ revoked: boolean }>(
      `/api/v1/account/security/sessions/${encodeURIComponent(sessionId)}`,
      { method: 'DELETE' },
    ));
  } catch {
    redirect('/account/security?error=reauth-required');
  }
  revalidatePath('/account/security');
  redirect(revoked ? '/account/security?session=revoked' : '/account/security?error=not-active');
}

export async function terminateOtherSessions(): Promise<void> {
  let revokedSessions = 0;
  try {
    ({ revokedSessions } = await mutate<{ revokedSessions: number }>(
      '/api/v1/account/security/sessions/revoke-others',
    ));
  } catch {
    redirect('/account/security?error=reauth-required');
  }
  revalidatePath('/account/security');
  redirect(`/account/security?revoked=${revokedSessions}`);
}

/** Ends every active session for the caller, including this browser. */
export async function terminateAllSessions(): Promise<void> {
  try {
    await mutate<{ revokedSessions: number }>('/api/v1/account/security/sessions/revoke-others');
  } catch {
    redirect('/account/security?error=reauth-required');
  }

  try {
    const { csrfToken } = await api<{ csrfToken: string }>('/api/v1/auth/session');
    const { setCookie } = await apiWithCookie<null>('/api/v1/auth/logout', {
      method: 'POST',
      csrfToken,
    });
    await relaySetCookie(setCookie);
  } catch {
    // Other sessions are already revoked. If this session disappeared in the
    // meantime, navigating to login is still the safe requested outcome.
  }
  redirect('/login?signed_out_all=1');
}

export async function beginSecurityReauthentication(formData: FormData): Promise<void> {
  const provider = String(formData.get('provider') ?? '');
  if (!PROVIDERS.has(provider)) redirect('/account/security?error=provider');

  let authorizationUrl: string;
  try {
    ({ authorizationUrl } = await mutate<{ authorizationUrl: string }>(
      `/api/v1/auth/${provider}/reauthentication`,
    ));
  } catch {
    redirect('/account/security?error=reauth-start');
  }
  redirect(authorizationUrl);
}

export async function reauthenticateWithLocalPassword(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) redirect('/account/security?error=local-reauth');

  try {
    await mutate<{ outcome: 'reauthenticated' }>('/api/v1/auth/local/reauthentication', {
      body: { email, password },
    });
  } catch {
    redirect('/account/security?error=local-reauth');
  }
  revalidatePath('/account/security');
  redirect('/account/security?reauth=done');
}

export async function changeLocalPassword(formData: FormData): Promise<void> {
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirmPassword') ?? '');
  if (!password || password !== confirm) redirect('/account/security?error=password-mismatch');
  try {
    await mutate<{ outcome: 'password-changed' }>('/api/v1/auth/local/password/change', { body: { password } });
  } catch {
    redirect('/account/security?error=password-change');
  }
  revalidatePath('/account/security');
  redirect('/account/security?password=changed');
}
