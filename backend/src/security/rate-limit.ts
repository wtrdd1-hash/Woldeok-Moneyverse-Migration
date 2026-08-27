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

export function tierFor(pathname: string, method: string): RateLimitTier {
  if (AUTH_PATH.test(pathname)) return { name: 'auth', limit: AUTH_LIMIT };
  if (pathname.startsWith('/api/') && method !== 'GET') {
    return { name: 'sensitive', limit: SENSITIVE_LIMIT };
  }
  return { name: 'read', limit: READ_LIMIT };
}

/**
 * Enabling `trustForwardedFor` without a reverse proxy that strips and
 * rewrites `X-Forwarded-For` lets a client forge the header and evade rate
 * limiting entirely, so the default is false and the header is ignored
 * outright rather than merely deprioritised.
 */
export function requestClientKey(request: KeyableRequest, options: ClientKeyOptions): string {
  if (options.trustForwardedFor) {
    const forwarded = request.headers['x-forwarded-for'];
    const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const first = raw?.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.socket.remoteAddress ?? 'unknown';
}
