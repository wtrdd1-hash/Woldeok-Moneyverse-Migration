/**
 * A successful HTTP status is not evidence that a rotated administrator
 * session reached the browser. The Spring API opens the console with the
 * rotated host session, the host CSRF proof and a clear of the legacy session
 * cookie, and closes it with clears only (the earlier NestJS contract sent a
 * single session cookie, which is still accepted). Every header must be one of
 * those, each name at most once; anything else is refused.
 */
const SESSION_NAMES = new Set(['mv_session', '__Host-mv_session']);
const PROOF_NAMES = new Set(['mv_csrf', '__Host-mv_csrf']);
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

function futureMoment(value: unknown): number | null {
  if (typeof value !== 'string' || !ISO_UTC.test(value)) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp > Date.now() ? timestamp : null;
}

interface ParsedCookie { readonly name: string; readonly value: string; readonly maxAge: number }

/** One Set-Cookie with the attributes the API always sends, or null. */
function parseCookie(header: unknown): ParsedCookie | null {
  if (typeof header !== 'string') return null;
  const parts = header.split(';').map((part) => part.trim());
  const pair = parts.shift();
  if (!pair) return null;
  const separator = pair.indexOf('=');
  if (separator < 1) return null;
  const name = pair.slice(0, separator);
  const value = pair.slice(separator + 1);
  if (!SESSION_NAMES.has(name) && !PROOF_NAMES.has(name)) return null;
  if (value) {
    if (/[\s;,\x00-\x1f\x7f]/.test(value)) return null;
    try { decodeURIComponent(value); } catch { return null; }
  }

  const attributes = new Map<string, string>();
  for (const part of parts) {
    const equals = part.indexOf('=');
    const key = (equals === -1 ? part : part.slice(0, equals)).toLowerCase();
    const attributeValue = equals === -1 ? '' : part.slice(equals + 1);
    if (!key || attributes.has(key)) return null;
    attributes.set(key, attributeValue);
  }
  if (attributes.has('domain') || attributes.get('path') !== '/' ||
      attributes.get('samesite')?.toLowerCase() !== 'lax' ||
      !attributes.has('httponly') || attributes.get('httponly') !== '' ||
      (name.startsWith('__Host-') && !attributes.has('secure')) ||
      (attributes.has('secure') && attributes.get('secure') !== '')) return null;
  const maxAge = attributes.get('max-age');
  if (maxAge === undefined || !/^\d+$/.test(maxAge)) return null;
  const seconds = Number(maxAge);
  if (!Number.isSafeInteger(seconds)) return null;
  return { name, value, maxAge: seconds };
}

function parseAll(headers: readonly string[]): ParsedCookie[] | null {
  if (!Array.isArray(headers) || headers.length === 0) return null;
  const parsed = headers.map(parseCookie);
  if (parsed.some((cookie) => cookie === null)) return null;
  const cookies = parsed as ParsedCookie[];
  if (new Set(cookies.map((cookie) => cookie.name)).size !== cookies.length) return null;
  return cookies;
}

const isClear = (cookie: ParsedCookie) => cookie.value === '' && cookie.maxAge === 0;
const isLive = (cookie: ParsedCookie) => cookie.value !== '' && cookie.maxAge > 0;

function validOpenCookies(headers: readonly string[]): boolean {
  const cookies = parseAll(headers);
  if (!cookies) return false;
  const sessions = cookies.filter((cookie) => SESSION_NAMES.has(cookie.name) && isLive(cookie));
  const proofs = cookies.filter((cookie) => PROOF_NAMES.has(cookie.name) && isLive(cookie));
  const clears = cookies.filter(isClear);
  return sessions.length === 1 && proofs.length <= 1 &&
    sessions.length + proofs.length + clears.length === cookies.length;
}

function validCloseCookies(headers: readonly string[]): boolean {
  const cookies = parseAll(headers);
  if (!cookies) return false;
  return cookies.every(isClear) && cookies.some((cookie) => SESSION_NAMES.has(cookie.name));
}

export function verifiedConsoleOpen(payload: unknown, headers: readonly string[]): boolean {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) return false;
  const receipt = payload as Record<string, unknown>;
  const expiry = futureMoment(receipt.expiresAt);
  const idle = futureMoment(receipt.idleExpiresAt);
  return receipt.state === 'open' && typeof receipt.csrfToken === 'string' &&
    receipt.csrfToken.trim().length > 0 && expiry !== null && idle !== null &&
    idle <= expiry && validOpenCookies(headers);
}

export function verifiedConsoleClose(payload: unknown, headers: readonly string[]): boolean {
  return payload === null && validCloseCookies(headers);
}
