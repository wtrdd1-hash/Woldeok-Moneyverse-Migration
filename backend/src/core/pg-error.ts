/**
 * `catch (error)` is `unknown` under strict mode, but the original read
 * `error?.code` directly to recognise PostgreSQL error codes (unique
 * violation, check violation, serialization failure, ...) without ever
 * inspecting an error's declared type. This narrows the same access without
 * changing which codes are recognised.
 */
export function pgErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('code' in error)) return undefined;
  const { code } = error;
  return typeof code === 'string' ? code : undefined;
}

/**
 * The codes the database functions raise for an expected, caller-visible
 * command failure: a duplicate idempotency key, a violated check such as an
 * exhausted balance, a temporarily disabled reward policy, or an explicit
 * RAISE. These are conflicts, not server faults, and their database detail
 * must never reach the browser.
 */
const EXPECTED_COMMAND_FAILURE = new Set(['22023', '23505', '55000', 'P0001']);

export function isExpectedCommandFailure(error: unknown): boolean {
  const code = pgErrorCode(error);
  return code !== undefined && EXPECTED_COMMAND_FAILURE.has(code);
}

/**
 * 28000 is `invalid_authorization_specification`: the function rejected the
 * caller rather than the request. The original answered 400 for it, because
 * reaching one of these paths at all means the request named something the
 * caller may not act on — surfacing that as 403 would confirm the target
 * exists.
 */
export function isAuthorizationFailure(error: unknown): boolean {
  return pgErrorCode(error) === '28000';
}

function pgErrorMessage(error: unknown): string {
  if (typeof error !== 'object' || error === null || !('message' in error)) return '';
  const { message } = error;
  return typeof message === 'string' ? message : '';
}

/**
 * 42501 arrives from two places that mean opposite things.
 *
 * PostgreSQL's own privilege check phrases it as "permission denied for ...",
 * and that means a GRANT is missing — the deployment is broken and the caller
 * cannot fix it, so it must stay a 500 and page somebody. Every other 42501 in
 * this schema is a function deliberately refusing the caller's role
 * (`admin_require_superadmin`, `admin_role_holder`, a dozen others), which is
 * the security model working and belongs to the caller as a 403.
 *
 * The same distinction is drawn in `testing/database.ts`; an earlier version of
 * the tests treated all 42501 alike and would have failed on every correct
 * refusal.
 */
export function isRoleRefusal(error: unknown): boolean {
  return pgErrorCode(error) === '42501' && !pgErrorMessage(error).startsWith('permission denied');
}

/**
 * 22P02 is `invalid_text_representation`: a value the application accepted and
 * PostgreSQL would not parse — an address filter shaped like an address but
 * not one. It is the caller's typo, not a fault.
 */
export function isMalformedInput(error: unknown): boolean {
  return pgErrorCode(error) === '22P02';
}
