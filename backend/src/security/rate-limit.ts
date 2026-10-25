import { isIP } from 'node:net';

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
export const READ_LIMIT = 12000;

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
const CHEAP_AUTH_READ = /^(?:\/api\/v\d+)?\/auth\/(?:viewer|session|policy|providers)\/?$/;

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

// Repeated edge identity headers are ambiguous: accepting the first value can
// let a client-controlled duplicate split rate-limit and audit identities.
const single = (value: string | string[] | undefined): string | undefined =>
  (typeof value === 'string' ? value.trim() : '') || undefined;

/**
 * Who to count a request against.
 *
 * The trusted-proxy switch accepts only `CF-Connecting-IP`. Cloudflare
 * overwrites that header at the edge, while `X-Forwarded-For` can contain a
 * visitor-supplied first hop. Treating the latter as identity lets a caller
 * forge audit IPs and rotate rate-limit keys.
 *
 * When the trusted edge header is absent or malformed we fail closed to the
 * socket peer. In this deployment that may be the internal frontend proxy;
 * recording a less specific internal peer is safer than recording an
 * attacker-chosen public address.
 */
function validIp(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const candidate = value.trim();
  const family = isIP(candidate);
  if (family === 4) return candidate;
  if (family !== 6) return undefined;

  // The same IPv6 peer can be written with different case, zero padding and
  // compression. Canonicalizing before rate limiting prevents a fresh budget
  // from being allocated to each equivalent spelling.
  const canonical = new URL(`http://[${candidate}]/`).hostname.slice(1, -1);
  const mapped = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(canonical);
  if (!mapped) return canonical;

  // Node sockets commonly expose IPv4 peers as IPv4-mapped IPv6. Give those
  // peers the same tracker identity as their dotted IPv4 representation.
  const high = Number.parseInt(mapped[1]!, 16);
  const low = Number.parseInt(mapped[2]!, 16);
  return `${high >>> 8}.${high & 255}.${low >>> 8}.${low & 255}`;
}

export function requestClientKey(request: KeyableRequest, options: ClientKeyOptions): string {
  if (options.trustForwardedFor) {
    const connecting = validIp(single(request.headers['cf-connecting-ip']));
    if (connecting) return connecting;
  }
  return validIp(request.socket.remoteAddress) ?? 'unknown';
}
