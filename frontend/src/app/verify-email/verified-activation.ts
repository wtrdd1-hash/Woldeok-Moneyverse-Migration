/**
 * The backend consumes the one-time verification token before returning 2xx.
 * A successful HTTP status without the signed-in receipt and a browser-usable
 * session cookie is not evidence that the visitor can enter the new account.
 */
const SESSION_TOKEN = /^[A-Za-z0-9_-]{43}$/;
const COOKIE_NAMES = new Set(['mv_session', '__Host-mv_session']);
const MAX_SESSION_AGE_SECONDS = 180 * 24 * 60 * 60;

export function hasVerifiedEmailActivationReceipt(payload: unknown, setCookie: readonly string[]): boolean {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const receipt = payload as Record<string, unknown>;
  if (receipt.outcome !== 'signed-in' || receipt.consentCurrent !== true ||
      typeof receipt.csrfToken !== 'string' || !SESSION_TOKEN.test(receipt.csrfToken)) return false;

  // The local-auth controller emits exactly one session cookie. Forwarding an
  // unrelated cookie would let a 2xx proxy response mutate browser state.
  if (!Array.isArray(setCookie) || setCookie.length !== 1) return false;
  const header = setCookie[0];
  if (typeof header !== 'string' || /[\r\n]/.test(header)) return false;
  const [pair, ...attributeParts] = header.split(';').map((part) => part.trim());
  if (!pair) return false;
  const separator = pair.indexOf('=');
  if (separator < 1) return false;
  const name = pair.slice(0, separator);
  const value = pair.slice(separator + 1);
  if (!COOKIE_NAMES.has(name) || !SESSION_TOKEN.test(value)) return false;

  const attributes = new Map<string, string>();
  for (const part of attributeParts) {
    const index = part.indexOf('=');
    const key = (index < 0 ? part : part.slice(0, index)).toLowerCase();
    const val = index < 0 ? '' : part.slice(index + 1);
    if (!['path', 'httponly', 'samesite', 'max-age', 'secure'].includes(key) || attributes.has(key)) return false;
    attributes.set(key, val);
  }

  const maxAge = attributes.get('max-age');
  const age = maxAge && /^\d+$/.test(maxAge) ? Number(maxAge) : NaN;
  return attributes.get('path') === '/' && attributes.get('httponly') === '' &&
    attributes.get('samesite')?.toLowerCase() === 'lax' &&
    Number.isSafeInteger(age) && age > 0 && age <= MAX_SESSION_AGE_SECONDS &&
    (!attributes.has('secure') || attributes.get('secure') === '') &&
    (name !== '__Host-mv_session' || attributes.has('secure'));
}
