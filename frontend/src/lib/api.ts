import 'server-only';

import { cookies, headers } from 'next/headers';

/**
 * The only way this application reaches the API.
 *
 * `server-only` is not decoration: importing this from a client component is a
 * build error, and it needs to be, because the module reads the internal token
 * out of the environment. A client bundle that contained it would publish the
 * credential that separates the API from the internet.
 *
 * The browser never talks to the API. It talks to Next, and Next talks to the
 * API over the internal network — which is what lets the session stay a
 * same-origin HttpOnly cookie and keeps CSRF a same-origin problem.
 */

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://127.0.0.1:3020';

export class ApiError extends Error {
  readonly status: number;
  readonly detail: string | undefined;

  constructor(status: number, detail?: string) {
    super(detail ?? `API responded ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

interface ProblemDocument {
  readonly title?: string;
  readonly detail?: string;
  readonly errors?: string[];
}

function internalToken(): string {
  const token = process.env.INTERNAL_API_TOKEN;
  if (!token) {
    // Failing loudly beats sending an unauthenticated request the API will
    // refuse with a message that describes the wrong problem.
    throw new Error('INTERNAL_API_TOKEN is not configured');
  }
  return token;
}

async function callerCookies(): Promise<string> {
  const store = await cookies();
  return store
    .getAll()
    .map((entry) => `${entry.name}=${encodeURIComponent(entry.value)}`)
    .join('; ');
}

export interface ApiRequest {
  readonly method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  readonly body?: unknown;
  readonly csrfToken?: string;
  /** Seconds. Omit for no caching, which is right for anything per-caller. */
  readonly revalidate?: number;
  /**
   * Sends this cookie header instead of the caller's.
   *
   * For the one case that needs it: a server action that has just caused the
   * API to issue a session and must make a second call *as* that session,
   * within the same request, before the browser has ever sent the cookie back.
   */
  readonly cookieHeader?: string;
}

/**
 * Forwards the caller's session cookie so the API can resolve who they are.
 * Everything the API decides about a request — session, consent, role, CSRF —
 * it decides from what is forwarded here, not from anything Next asserts.
 */
export async function api<T>(path: string, request: ApiRequest = {}): Promise<T> {
  const { method = 'GET', body, csrfToken, revalidate } = request;

  const cookieHeader = request.cookieHeader ?? (await callerCookies());

  const requestHeaders: Record<string, string> = {
    'x-internal-token': internalToken(),
    accept: 'application/json',
  };
  if (cookieHeader) requestHeaders.cookie = cookieHeader;
  if (body !== undefined) requestHeaders['content-type'] = 'application/json';
  if (csrfToken) requestHeaders['x-csrf-token'] = csrfToken;

  // The real client address, so the API's rate limiter counts the visitor
  // rather than counting this process once for everybody.
  //
  // Both headers, and the API prefers the first: Cloudflare writes
  // `CF-Connecting-IP` itself and overwrites whatever the visitor sent, while
  // it appends to a visitor-supplied `X-Forwarded-For`. Forwarding only the
  // appendable one would let a visitor be counted as somebody else.
  const incoming = await headers();
  const connectingIp = incoming.get('cf-connecting-ip');
  if (connectingIp) requestHeaders['cf-connecting-ip'] = connectingIp;
  const forwardedFor = incoming.get('x-forwarded-for');
  if (forwardedFor) requestHeaders['x-forwarded-for'] = forwardedFor;

  // The origin the browser actually used, so the API can complete an OAuth
  // round trip on the name the visitor is on rather than on the canonical one.
  // The API does not trust it: it matches this against the origins registered
  // in OAUTH_ALLOWED_REDIRECT_URIS and falls back to the canonical URI when it
  // matches none, so relaying it can only ever select, never introduce.
  const forwardedHost = incoming.get('x-forwarded-host') ?? incoming.get('host');
  if (forwardedHost) {
    const proto = incoming.get('x-forwarded-proto') ?? 'https';
    requestHeaders['x-public-origin'] = `${proto}://${forwardedHost}`;
  }

  const response = await fetch(`${API_ORIGIN}${path}`, {
    method,
    headers: requestHeaders,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    // A per-caller response must never be cached: it carries one member's
    // balances. Only pages that pass an explicit revalidate are public.
    ...(revalidate === undefined
      ? { cache: 'no-store' as const }
      : { next: { revalidate } }),
  });

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const payload: unknown = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const problem = payload as ProblemDocument | null;
    throw new ApiError(response.status, problem?.detail ?? problem?.title);
  }

  return payload as T;
}

/**
 * For public data, which is the same for everybody.
 *
 * It sends no cookie and reads no header, and that is what lets a page calling
 * it stay statically generated: touching `cookies()` marks a route dynamic in
 * Next, so a landing page that forwarded a session it does not use would give
 * up its prerender — and with it the finished HTML a crawler needs and the
 * instant first paint a visitor gets.
 *
 * Returning null rather than throwing preserves the original's behaviour: the
 * public pages stayed readable with the content service offline and showed an
 * explicitly unknown state instead of inventing a healthy one.
 */
export async function publicApi<T>(path: string, revalidate: number): Promise<T | null> {
  try {
    const response = await fetch(`${API_ORIGIN}${path}`, {
      headers: { 'x-internal-token': internalToken(), accept: 'application/json' },
      next: { revalidate },
    });
    if (!response.ok) return null;
    const text = await response.text();
    return (text ? JSON.parse(text) : null) as T;
  } catch {
    return null;
  }
}

/**
 * The same request as `api`, with the response's `set-cookie` handed back
 * instead of dropped.
 *
 * Only the auth routes need this: they are the ones that issue or clear the
 * session, and a server action has to relay that header to the browser itself
 * because the API's response never reaches it directly.
 */
export async function apiWithCookie<T>(
  path: string,
  request: ApiRequest = {},
): Promise<{ readonly payload: T; readonly setCookie: readonly string[] }> {
  const { method = 'GET', body, csrfToken } = request;

  const cookieHeader = request.cookieHeader ?? (await callerCookies());

  const requestHeaders: Record<string, string> = {
    'x-internal-token': internalToken(),
    accept: 'application/json',
  };
  if (cookieHeader) requestHeaders.cookie = cookieHeader;
  if (body !== undefined) requestHeaders['content-type'] = 'application/json';
  if (csrfToken) requestHeaders['x-csrf-token'] = csrfToken;

  const incoming = await headers();
  const forwardedFor = incoming.get('x-forwarded-for');
  if (forwardedFor) requestHeaders['x-forwarded-for'] = forwardedFor;

  // The origin the browser actually used, so the API can complete an OAuth
  // round trip on the name the visitor is on rather than on the canonical one.
  // The API does not trust it: it matches this against the origins registered
  // in OAUTH_ALLOWED_REDIRECT_URIS and falls back to the canonical URI when it
  // matches none, so relaying it can only ever select, never introduce.
  const forwardedHost = incoming.get('x-forwarded-host') ?? incoming.get('host');
  if (forwardedHost) {
    const proto = incoming.get('x-forwarded-proto') ?? 'https';
    requestHeaders['x-public-origin'] = `${proto}://${forwardedHost}`;
  }

  const response = await fetch(`${API_ORIGIN}${path}`, {
    method,
    headers: requestHeaders,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: 'no-store',
  });

  const text = await response.text();
  const payload: unknown = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const problem = payload as ProblemDocument | null;
    throw new ApiError(response.status, problem?.detail ?? problem?.title);
  }

  return { payload: payload as T, setCookie: response.headers.getSetCookie() };
}

/**
 * Posts raw bytes.
 *
 * The photo upload is the one request in this application whose body is not
 * JSON. The API's storage layer sniffs the image itself rather than trusting
 * a declared type, so the bytes have to arrive untouched — a JSON round trip
 * would re-encode them and a multipart wrapper would prepend a boundary the
 * sniffer would then read as the file's first bytes.
 */
export async function apiBytes<T>(
  path: string,
  bytes: ArrayBuffer,
  { contentType, csrfToken }: { readonly contentType: string; readonly csrfToken: string },
): Promise<T> {
  const response = await fetch(`${API_ORIGIN}${path}`, {
    method: 'POST',
    headers: {
      'x-internal-token': internalToken(),
      'x-csrf-token': csrfToken,
      'content-type': contentType,
      accept: 'application/json',
      ...(await callerCookies().then((cookie) => (cookie ? { cookie } : {}))),
    },
    body: bytes,
    cache: 'no-store',
  });

  const text = await response.text();
  const payload: unknown = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const problem = payload as ProblemDocument | null;
    throw new ApiError(response.status, problem?.detail ?? problem?.title);
  }
  return payload as T;
}

/** Per-caller, and forgiving. Use `publicApi` for anything a crawler sees. */
export async function apiOrNull<T>(path: string, request: ApiRequest = {}): Promise<T | null> {
  try {
    return await api<T>(path, request);
  } catch {
    return null;
  }
}
