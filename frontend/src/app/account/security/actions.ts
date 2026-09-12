'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { mutate } from '@/lib/mutate';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PROVIDERS = new Set(['discord', 'google']);

export async function terminateSession(formData: FormData): Promise<void> {
  const sessionId = String(formData.get('sessionId') ?? '');
  if (!UUID.test(sessionId)) redirect('/account/security?error=invalid-session');
  try {
    const result = await mutate<{ revoked: boolean }>(
      `/api/v1/account/security/sessions/${encodeURIComponent(sessionId)}`,
      { method: 'DELETE' },
    );
    revalidatePath('/account/security');
    redirect(result.revoked ? '/account/security?session=revoked' : '/account/security?error=not-active');
  } catch {
    redirect('/account/security?error=reauth-required');
  }
}

export async function terminateOtherSessions(): Promise<void> {
  try {
    const result = await mutate<{ revokedSessions: number }>(
      '/api/v1/account/security/sessions/revoke-others',
    );
    revalidatePath('/account/security');
    redirect(`/account/security?revoked=${result.revokedSessions}`);
  } catch {
    redirect('/account/security?error=reauth-required');
  }
}

export async function beginSecurityReauthentication(formData: FormData): Promise<void> {
  const provider = String(formData.get('provider') ?? '');
  if (!PROVIDERS.has(provider)) redirect('/account/security?error=provider');
  try {
    const { authorizationUrl } = await mutate<{ authorizationUrl: string }>(
      `/api/v1/auth/${provider}/reauthentication`,
    );
    redirect(authorizationUrl);
  } catch {
    redirect('/account/security?error=reauth-start');
  }
}
