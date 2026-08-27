import 'server-only';

import { cookies } from 'next/headers';

/**
 * Relays a `set-cookie` the API issued to the browser.
 *
 * Only the session cookie ever travels this path. The browser never talks to
 * the API — it talks to Next — so when the API signs a visitor in or out, the
 * header it emits reaches this process and stops there unless something puts
 * it back on the response. That is this.
 *
 * The attributes are re-read from the header rather than hard-coded, so the
 * cookie's name, lifetime and `Secure` flag stay decided in one place: the
 * API's `sessionCookie()`, which already tracks the `__Host-` prefix rules.
 */
export async function relaySetCookie(headers: readonly string[]): Promise<void> {
  const store = await cookies();
  for (const header of headers) {
    const parsed = parseSetCookie(header);
    if (!parsed) continue;
    if (parsed.maxAge === 0 || parsed.value === '') {
      store.delete(parsed.name);
      continue;
    }
    store.set({
      name: parsed.name,
      value: parsed.value,
      path: parsed.path ?? '/',
      httpOnly: parsed.httpOnly,
      secure: parsed.secure,
      sameSite: parsed.sameSite,
      ...(parsed.maxAge === undefined ? {} : { maxAge: parsed.maxAge }),
    });
  }
}

/**
 * The `name=value` pair from a `set-cookie`, ready to be sent straight back
 * as a request cookie. A server action that has just been issued a session
 * needs it to make its next call as that session, before the browser has had
 * any chance to send the cookie itself.
 */
export function sessionCookiePair(headers: readonly string[]): string | null {
  for (const header of headers) {
    const parsed = parseSetCookie(header);
    if (parsed && parsed.value !== '') {
      return `${parsed.name}=${encodeURIComponent(parsed.value)}`;
    }
  }
  return null;
}

interface ParsedCookie {
  readonly name: string;
  readonly value: string;
  readonly path?: string;
  readonly maxAge?: number;
  readonly httpOnly: boolean;
  readonly secure: boolean;
  readonly sameSite: 'lax' | 'strict' | 'none';
}

function parseSetCookie(header: string): ParsedCookie | null {
  const [pair, ...attributes] = header.split(';');
  if (!pair) return null;
  const separator = pair.indexOf('=');
  if (separator < 1) return null;

  const name = pair.slice(0, separator).trim();
  let value: string;
  try {
    value = decodeURIComponent(pair.slice(separator + 1).trim());
  } catch {
    return null;
  }

  let path: string | undefined;
  let maxAge: number | undefined;
  let httpOnly = false;
  let secure = false;
  let sameSite: 'lax' | 'strict' | 'none' = 'lax';

  for (const attribute of attributes) {
    const [rawKey, ...rest] = attribute.split('=');
    const key = (rawKey ?? '').trim().toLowerCase();
    const attributeValue = rest.join('=').trim();
    if (key === 'path') path = attributeValue;
    else if (key === 'max-age') {
      const parsed = Number(attributeValue);
      if (Number.isFinite(parsed)) maxAge = parsed;
    } else if (key === 'httponly') httpOnly = true;
    else if (key === 'secure') secure = true;
    else if (key === 'samesite') {
      const lowered = attributeValue.toLowerCase();
      if (lowered === 'lax' || lowered === 'strict' || lowered === 'none') sameSite = lowered;
    }
  }

  return { name, value, ...(path === undefined ? {} : { path }), ...(maxAge === undefined ? {} : { maxAge }), httpOnly, secure, sameSite };
}
