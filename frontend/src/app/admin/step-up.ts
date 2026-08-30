import 'server-only';

import { mutate } from '@/lib/mutate';

/**
 * Spends a TOTP code, immediately before a high-risk change.
 *
 * A plain module rather than another `'use server'` export: every export of a
 * server-action file becomes its own callable endpoint, and a step-up that
 * can be invoked on its own — separately from the change it was meant to
 * authorise — is a step-up an operator can be talked into spending. Here it
 * can only be reached from inside the server action that then performs the
 * change the dialog described.
 *
 * The API's `SecondFactorGuard` gives the spent code a two-minute life, so
 * the pairing is enforced by the clock as well as by this file's shape.
 */
export async function spendSecondFactorCode(code: string): Promise<void> {
  await mutate('/api/v1/admin/security/second-factor/verifications', { body: { code } });
}

/** The six digits an authenticator app shows. */
export const STEP_UP_CODE = /^[0-9]{6}$/;
