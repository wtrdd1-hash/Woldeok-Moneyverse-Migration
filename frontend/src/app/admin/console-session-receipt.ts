/**
 * A successful HTTP status is not evidence that a rotated administrator
 * session reached the browser. The NestJS contract always emits exactly one
 * host-only session cookie; the relay silently ignores malformed headers.
 */
const SESSION_NAMES = new Set(['mv_session', '__Host-mv_session']);
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

function futureMoment(value: unknown): number | null {
  if (typeof value !== 'string' || !ISO_UTC.test(value)) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp > Date.now() ? timestamp : null;
}

function validSessionCookie(headers: readonly string[], operation: 'open' | 'close'): boolean {
  if (!Array.isArray(headers) || headers.length !== 1 || typeof headers[0] !== 'string') return false;
  const parts = headers[0].split(';').map((part) => part.trim());
  const pair = parts.shift();
  if (!pair) return false;
  const separator = pair.indexOf('=');
  if (separator < 1) return false;
  const name = pair.slice(0, separator);
  const value = pair.slice(separator + 1);
  if (!SESSION_NAMES.has(name)) return false;
  if (operation === 'open') {
    if (!value || /[\s;,\x00-\x1f\x7f]/.test(value)) return false;
    try { decodeURIComponent(value); } catch { return false; }
  } else if (value !== '') return false;

  const attributes = new Map<string, string>();
  for (const part of parts) {
    const equals = part.indexOf('=');
    const key = (equals === -1 ? part : part.slice(0, equals)).toLowerCase();
    const attributeValue = equals === -1 ? '' : part.slice(equals + 1);
    if (!key || attributes.has(key)) return false;
    attributes.set(key, attributeValue);
  }
  if (attributes.has('domain') || attributes.get('path') !== '/' ||
      attributes.get('samesite')?.toLowerCase() !== 'lax' ||
      !attributes.has('httponly') || attributes.get('httponly') !== '' ||
      (name.startsWith('__Host-') && !attributes.has('secure')) ||
      (attributes.has('secure') && attributes.get('secure') !== '')) return false;
  const maxAge = attributes.get('max-age');
  if (maxAge === undefined || !/^\d+$/.test(maxAge)) return false;
  const seconds = Number(maxAge);
  if (!Number.isSafeInteger(seconds)) return false;
  return operation === 'open' ? seconds > 0 : seconds === 0;
}

export function verifiedConsoleOpen(payload: unknown, headers: readonly string[]): boolean {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) return false;
  const receipt = payload as Record<string, unknown>;
  const expiry = futureMoment(receipt.expiresAt);
  const idle = futureMoment(receipt.idleExpiresAt);
  return receipt.state === 'open' && typeof receipt.csrfToken === 'string' &&
    receipt.csrfToken.trim().length > 0 && expiry !== null && idle !== null &&
    idle <= expiry && validSessionCookie(headers, 'open');
}

export function verifiedConsoleClose(payload: unknown, headers: readonly string[]): boolean {
  return payload === null && validSessionCookie(headers, 'close');
}
