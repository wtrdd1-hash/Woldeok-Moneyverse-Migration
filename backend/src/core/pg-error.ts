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
