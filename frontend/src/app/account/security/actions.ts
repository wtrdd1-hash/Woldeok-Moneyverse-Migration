'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { api, apiWithCookie } from '@/lib/api';
import { relaySetCookie } from '@/lib/cookie-relay';
import { mutate } from '@/lib/mutate';
import { isVerifiedCredentialReceipt } from './credential-receipts';
import { parseSecuritySessions } from './account-security-evidence';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PROVIDERS = new Set(['discord', 'google']);


/** Only navigate to the provider's own OAuth endpoint with a complete PKCE challenge. */
function verifiedReauthenticationUrl(receipt: unknown, provider: string): string {
  if (typeof receipt !== 'object' || receipt === null ||
      !('authorizationUrl' in receipt) || typeof receipt.authorizationUrl !== 'string') {
    throw new Error('missing OAuth authorization receipt');
  }
  const endpoint = provider === 'discord'
    ? 'https://discord.com/oauth2/authorize'
    : 'https://accounts.google.com/o/oauth2/v2/auth';
  const url = new URL(receipt.authorizationUrl);
  if (url.origin + url.pathname !== endpoint || url.username || url.password || url.hash) {
    throw new Error('unexpected OAuth provider endpoint');
  }
  const param = (key: string): string => {
    const values = url.searchParams.getAll(key);
    if (values.length !== 1 || !values[0]) throw new Error(`missing OAuth ${key}`);
    return values[0];
  };
  if (param('response_type') !== 'code' || param('code_challenge_method') !== 'S256' ||
      !/^[A-Za-z0-9_-]{16,256}$/.test(param('state')) ||
      !/^[A-Za-z0-9_-]{43,128}$/.test(param('code_challenge')) ||
      param('scope') !== (provider === 'discord' ? 'identify' : 'openid profile')) {
    throw new Error('invalid OAuth challenge');
  }
  param('client_id');
  if (provider === 'google' && !/^[A-Za-z0-9_-]{16,256}$/.test(param('nonce'))) {
    throw new Error('missing Google OIDC nonce');
  }
  const callback = new URL(param('redirect_uri'));
  const isLocalHttp = callback.protocol === 'http:' &&
    (callback.hostname === 'localhost' || callback.hostname === '127.0.0.1');
  if ((callback.protocol !== 'https:' && !isLocalHttp) || callback.username || callback.password ||
      callback.search || callback.hash || callback.pathname !== `/auth/${provider}/callback`) {
    throw new Error('invalid OAuth callback');
  }
  return receipt.authorizationUrl;
}

async function verifiedSessionReadback() {
  const inventory = parseSecuritySessions(await api<unknown>('/api/v1/account/security/sessions'));
  if (inventory === null) throw new Error('session readback is unavailable or invalid');
  return inventory;
}

function verifiedRevokeCount(value: unknown): number {
  if (typeof value !== 'object' || value === null || !('revokedSessions' in value) ||
    !Number.isSafeInteger(value.revokedSessions) || (value.revokedSessions as number) < 0) {
    throw new Error('invalid session revocation receipt');
  }
  return value.revokedSessions as number;
}

export async function terminateSession(formData: FormData): Promise<void> {
  const sessionId = String(formData.get('sessionId') ?? '');
  if (!UUID.test(sessionId)) redirect('/account/security?error=invalid-session');

  let revoked = false;
  try {
    const receipt = await mutate<{ revoked: boolean }>(
      `/api/v1/account/security/sessions/${encodeURIComponent(sessionId)}`,
      { method: 'DELETE' },
    );
    if (typeof receipt?.revoked !== 'boolean') throw new Error('invalid revocation receipt');
    const inventory = await verifiedSessionReadback();
    if (inventory.some((session) => session.sessionId.toLowerCase() === sessionId.toLowerCase())) {
      throw new Error('target session still active after revocation');
    }
    revoked = receipt.revoked;
  } catch {
    redirect('/account/security?error=reauth-required');
  }
  revalidatePath('/account/security');
  redirect(revoked ? '/account/security?session=revoked' : '/account/security?error=not-active');
}

export async function terminateOtherSessions(): Promise<void> {
  let revokedSessions = 0;
  try {
    const receipt = await mutate<unknown>('/api/v1/account/security/sessions/revoke-others');
    revokedSessions = verifiedRevokeCount(receipt);
    const inventory = await verifiedSessionReadback();
    if (inventory.some((session) => !session.current)) {
      throw new Error('other sessions remain active after revocation');
    }
  } catch {
    redirect('/account/security?error=reauth-required');
  }
  revalidatePath('/account/security');
  redirect(`/account/security?revoked=${revokedSessions}`);
}

/** Backend logout must supply an actionable browser cookie deletion, not just a 2xx response. */
function hasSessionClearCookie(headers: readonly string[]): boolean {
  return headers.some((header) => {
    const [pair, ...rawAttributes] = header.split(';');
    const cookie = pair?.trim() ?? '';
    if (cookie !== 'mv_session=' && cookie !== '__Host-mv_session=') return false;
    const attributes = rawAttributes.map((attribute) => attribute.trim().toLowerCase());
    if (!attributes.includes('max-age=0') || !attributes.includes('path=/')) return false;
    if (cookie.startsWith('__Host-') &&
      (!attributes.includes('secure') || attributes.some((attribute) => attribute.startsWith('domain=')))) {
      return false;
    }
    return true;
  });
}

/** Ends every active session for the caller, including this browser. */
export async function terminateAllSessions(): Promise<void> {
  try {
    const receipt = await mutate<unknown>('/api/v1/account/security/sessions/revoke-others');
    verifiedRevokeCount(receipt);
    const inventory = await verifiedSessionReadback();
    if (inventory.some((session) => !session.current)) {
      throw new Error('other sessions remain active after revocation');
    }
  } catch {
    redirect('/account/security?error=reauth-required');
  }

  try {
    const { csrfToken } = await api<{ csrfToken: string }>('/api/v1/auth/session');
    const { setCookie } = await apiWithCookie<null>('/api/v1/auth/logout', {
      method: 'POST',
      csrfToken,
    });
    if (!hasSessionClearCookie(setCookie)) throw new Error('logout clear-cookie evidence missing');
    await relaySetCookie(setCookie);
  } catch {
    // Revoking other sessions is not evidence that this browser logged out.
    redirect('/account/security?error=logout');
  }
  redirect('/login?signed_out_all=1');
}

export async function beginSecurityReauthentication(formData: FormData): Promise<void> {
  const provider = String(formData.get('provider') ?? '');
  if (!PROVIDERS.has(provider)) redirect('/account/security?error=provider');

  let authorizationUrl: string;
  try {
    authorizationUrl = verifiedReauthenticationUrl(
      await mutate<unknown>(`/api/v1/auth/${provider}/reauthentication`),
      provider,
    );
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
    const receipt: unknown = await mutate<unknown>('/api/v1/auth/local/reauthentication', {
      body: { email, password },
    });
    if (!isVerifiedCredentialReceipt(receipt, 'reauthentication')) throw new Error('unverified reauthentication receipt');
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
    const receipt: unknown = await mutate<unknown>('/api/v1/auth/local/password/change', { body: { password } });
    if (!isVerifiedCredentialReceipt(receipt, 'password-change')) throw new Error('unverified password change receipt');
  } catch {
    redirect('/account/security?error=password-change');
  }
  revalidatePath('/account/security');
  redirect('/account/security?password=changed');
}

export async function requestLocalEmailChange(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim();
  if (!email) redirect('/account/security?error=email-change');
  try {
    const receipt: unknown = await mutate<unknown>('/api/v1/auth/local/email-change/request', { body: { email } });
    if (!isVerifiedCredentialReceipt(receipt, 'email-change')) throw new Error('unverified email change receipt');
  } catch {
    redirect('/account/security?error=email-change');
  }
  redirect('/account/security?email=verification-sent');
}
