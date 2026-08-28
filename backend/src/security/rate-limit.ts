export interface ClientKeyOptions {
  readonly trustForwardedFor: boolean;
}

export interface KeyableRequest {
  readonly headers: Record<string, string | string[] | undefined>;
  readonly socket: { readonly remoteAddress?: string | undefined };
}

export type RateLimitTierName = 'auth' | 'sensitive' | 'read';

export interface RateLimitTier {
  readonly name: RateLimitTierName;
  readonly limit: number;
}

/**
 * Per-minute request budgets, carried over from the original application.
 * `auth` is tightest because those routes reach the OAuth providers and the
 * session table; `sensitive` covers every API write; `read` is everything
 * else.
 */
export const AUTH_LIMIT = 20;
export const SENSITIVE_LIMIT = 60;
export const READ_LIMIT = 240;

/**
 * The backend mounts everything under a global `/api` prefix with URI
 * versioning, so an auth route reaches this function as `/api/v1/auth/...`,
 * not `/auth/...`. Both forms are matched: the unversioned form is what the
 * Next.js edge presents publicly, and keeping both here means the two cannot
 * drift into disagreeing about which requests are expensive.
 *
 * The trailing slash is required, so `/api/v1/authors` is not an auth route.
 */
const AUTH_PATH = /^(?:\/api\/v\d+)?\/auth\//;

/**
 * The two auth routes that are not auth work.
 *
 * `viewer` is read once per page load to decide whether the masthead shows a
 * sign-in button, and `session` is read once more by every member page and
 * before every write, to fetch the CSRF token it spends immediately. Both are
 * a single lookup of the caller's own session — the cost of any other read —
 * and neither creates a session, reaches an OAuth provider or accepts a
 * credential.
 *
 * They were inside the auth tier, which is sized for the routes that do those
 * things: twenty a minute between them. Two per page meant a reader who
 * refreshed ten times in a minute spent the budget, and from then on the
 * viewer lookup came back 429, the front end read that as "signed out" and
 * offered them a login button — while their session cookie was untouched and
 * their socket carried on chatting.
 */
const CHEAP_AUTH_READ = /^(?:\/api\/v\d+)?\/auth\/(?:viewer|session)\/?$/;

/**
 * The path a tier is decided from, without the query string.
 *
 * Express gives `originalUrl` for a request that has passed through a global
 * prefix; `url` is the fallback. Either can carry `?...`, and a query string
 * has no bearing on how expensive a route is.
 */
export function requestPath(request: {
  readonly originalUrl?: unknown;
  readonly url?: unknown;
}): string {
  const raw =
    typeof request.originalUrl === 'string'
      ? request.originalUrl
      : typeof request.url === 'string'
        ? request.url
        : '/';
  const cut = raw.indexOf('?');
  return cut === -1 ? raw : raw.slice(0, cut);
}

export function tierFor(pathname: string, method: string): RateLimitTier {
  if (method === 'GET' && CHEAP_AUTH_READ.test(pathname)) {
    return { name: 'read', limit: READ_LIMIT };
  }
  if (AUTH_PATH.test(pathname)) return { name: 'auth', limit: AUTH_LIMIT };
  if (pathname.startsWith('/api/') && method !== 'GET') {
    return { name: 'sensitive', limit: SENSITIVE_LIMIT };
  }
  return { name: 'read', limit: READ_LIMIT };
}

const single = (value: string | string[] | undefined): string | undefined =>
  (Array.isArray(value) ? value[0] : value)?.trim() || undefined;

/**
 * Who to count a request against.
 *
 * Enabling `trustForwardedFor` without a reverse proxy that strips and
 * rewrites `X-Forwarded-For` lets a client forge the header and evade rate
 * limiting entirely, so the default is false and the header is ignored
 * outright rather than merely deprioritised.
 *
 * `CF-Connecting-IP` is preferred over it where both are present. Cloudflare
 * writes that header itself and overwrites whatever a client sent, whereas it
 * *appends* to a client-supplied `X-Forwarded-For` — so the first entry of
 * that list is a value the visitor chose. Reading it means one visitor can
 * spend another's budget by naming them, which on this deployment is the
 * difference between a reader staying signed in and being told they are not.
 *
 * The `X-Forwarded-For` fallback still takes the first entry rather than the
 * last. The last entry is only the client behind a chain of exactly one
 * appending proxy, and this application is reached through more than one on
 * some paths; a wrong guess there collapses every visitor onto a single key,
 * which is worse than the forgery it would prevent.
 */
export function requestClientKey(request: KeyableRequest, options: ClientKeyOptions): string {
  if (options.trustForwardedFor) {
    const connecting = single(request.headers['cf-connecting-ip']);
    if (connecting) return connecting;
    const forwarded = single(request.headers['x-forwarded-for']);
    const first = forwarded?.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.socket.remoteAddress ?? 'unknown';
}
