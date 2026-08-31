const LOCAL_HTTP_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]']);
const DISCORD_PUBLIC_KEY = /^[0-9a-f]{64}$/i;
const DISCORD_SNOWFLAKE = /^\d{16,22}$/;
const DISCORD_ROUTE_KEY = /^[a-z][a-z0-9_-]{1,31}$/;

/**
 * A discriminated union, not an interface with optional fields: a disabled
 * provider carries no credentials, so checking `.enabled` narrows the
 * credential fields in without a cast. Weakening this to optional properties
 * forces every consumer to re-assert what the check already proved.
 */
export type OAuthProviderConfig =
  | { readonly enabled: false }
  | {
      readonly enabled: true;
      readonly clientId: string;
      readonly clientSecret: string;
      /**
       * The redirect URI used when nothing selects another one. It is the URI
       * derived from APP_BASE_URL, so a deployment that never registers a
       * second origin behaves exactly as it did before this became a list.
       */
      readonly redirectUri: string;
      /**
       * Every redirect URI this deployment may complete a sign-in on, the
       * canonical one first.
       *
       * A list rather than a single value because a deployment outlives its
       * hostname: a domain gets renamed, a second name is pointed at the same
       * stack, an origin is retired. With one value, the first of those
       * silently removes the login button -- `oauthProvider` returns
       * `{enabled: false}` for an origin mismatch, so nothing raises, nothing
       * logs, and the deployment reports healthy.
       *
       * It is still a closed set. Each entry is registered ahead of time in
       * OAUTH_ALLOWED_REDIRECT_URIS and checked here, so a request can only
       * ever SELECT among origins an operator approved -- it can never
       * introduce one. That distinction is the whole design: the objection to
       * `X-Forwarded-Host` is that it lets a caller decide, and choosing from
       * a pre-registered list is not deciding.
       */
      readonly redirectUris: readonly string[];
    };

export interface DiscordInteractionsPolicy {
  readonly guilds: Record<
    string,
    { readonly requiredRoleIds: string[]; readonly roleMode: 'any' | 'all' }
  >;
}

/** A discriminated union for the same reason as OAuthProviderConfig. */
export type DiscordInteractionsConfig =
  | { readonly enabled: false }
  | {
      readonly enabled: true;
      readonly publicKey: string;
      readonly policy: DiscordInteractionsPolicy;
      readonly rateLimit: { readonly limit: number; readonly windowMs: number };
    };

/**
 * The outbox worker's half of the Discord surface.
 *
 * The disabled variant carries a reason, which the other unions here do not.
 * A background job that quietly does not run is how the outbox went unnoticed
 * for the eleven migrations between 027 and 054, and "it is off because
 * DISCORD_OUTBOX_ENABLED is not true" is a different problem from "it is off
 * because the token belongs to the other deployment". The runner logs it at
 * boot; the reason never contains the token.
 */
export type DiscordOutboxConfig =
  | { readonly enabled: false; readonly reason: string }
  | {
      readonly enabled: true;
      readonly botToken: string;
      readonly applicationId: string;
      /** Route key to channel id. `outbox_claim_pending` returns the key. */
      readonly channels: Readonly<Record<string, string>>;
      readonly intervalMs: number;
    };

/**
 * How many connections this process may hold, and how long it waits.
 *
 * 17.9 asks for a ceiling on both sides -- the pool here and a
 * `CONNECTION LIMIT` on the role -- so that a burst of traffic is refused by
 * the pool rather than by Postgres, where it would take the whole cluster's
 * connection budget with it and lock out the reconciler and the backup role
 * as well.
 */
export interface DatabasePoolConfig {
  readonly max: number;
  readonly idleTimeoutMillis: number;
  readonly connectionTimeoutMillis: number;
}

export interface AppConfig {
  readonly port: number;
  readonly baseUrl: string;
  readonly databaseUrl: string | undefined;
  readonly databasePool: DatabasePoolConfig;
  readonly production: boolean;
  readonly cookieSecure: boolean;
  readonly adsEnabled: boolean;
  readonly seoIndexingEnabled: boolean;
  readonly trustProxyForwardedFor: boolean;
  readonly internalToken: string;
  readonly oauth: { readonly discord: OAuthProviderConfig; readonly google: OAuthProviderConfig };
  readonly discordInteractions: DiscordInteractionsConfig;
  readonly discordOutbox: DiscordOutboxConfig;
}

export const CONFIG = Symbol('CONFIG');

function parseUrl(value: string, name: string): URL {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    if (url.username || url.password || url.search || url.hash) throw new Error();
    if (url.protocol === 'http:' && !LOCAL_HTTP_HOSTS.has(url.hostname)) throw new Error();
    return url;
  } catch {
    throw new Error(`${name} must be an absolute HTTPS URL (HTTP is allowed only for localhost)`);
  }
}

/**
 * A provider is available only when its configuration is complete and its
 * callback lands back on this application's own origin and expected path. A
 * callback pointing elsewhere is a redirect this application does not
 * control, so the provider is treated as unconfigured rather than trusted.
 */
function oauthProvider(options: {
  readonly clientId: string | undefined;
  readonly clientSecret: string | undefined;
  readonly redirectUri: string | undefined;
  readonly name: string;
  readonly baseUrl: string;
  readonly callbackPath: string;
  readonly allowedOrigins: readonly string[];
}): OAuthProviderConfig {
  const { clientId, clientSecret, redirectUri, name, baseUrl, callbackPath, allowedOrigins } =
    options;
  if (!clientId || !clientSecret || !redirectUri) return { enabled: false };
  const callbackUrl = parseUrl(redirectUri, `${name} redirect URI`);
  const applicationUrl = new URL(baseUrl);
  if (callbackUrl.origin !== applicationUrl.origin) return { enabled: false };
  if (callbackUrl.pathname !== callbackPath) return { enabled: false };

  // The canonical URI leads, and every additional origin contributes the same
  // callback path on itself. The path is not taken from the operator's entry:
  // OAUTH_ALLOWED_REDIRECT_URIS names ORIGINS this deployment answers on, and
  // letting it name paths too would turn one malformed entry into a redirect
  // to somewhere the router does not serve.
  const uris = [callbackUrl.toString()];
  for (const origin of allowedOrigins) {
    const candidate = new URL(callbackPath, origin).toString();
    if (!uris.includes(candidate)) uris.push(candidate);
  }

  return {
    enabled: true,
    clientId,
    clientSecret,
    redirectUri: callbackUrl.toString(),
    redirectUris: uris,
  };
}

/**
 * The origins a sign-in may be completed on, beyond APP_BASE_URL.
 *
 * Parsed through `parseUrl`, so an entry carrying credentials, a query or a
 * fragment is rejected rather than half-honoured, and plain HTTP is refused
 * outside localhost. A malformed entry throws at boot: this list decides where
 * a session cookie may be issued, and a deployment that starts having quietly
 * dropped one of them is worse than a deployment that refuses to start.
 */
function allowedRedirectOrigins(env: NodeJS.ProcessEnv): readonly string[] {
  return String(env.OAUTH_ALLOWED_REDIRECT_URIS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => parseUrl(value, 'OAUTH_ALLOWED_REDIRECT_URIS entry').origin);
}

/**
 * Picks the redirect URI for one request.
 *
 * `requestOrigin` is what the browser used, relayed by the frontend. It is not
 * trusted -- it is matched against the registered list, and anything that does
 * not match falls back to the canonical URI. A caller who forges the header
 * therefore gets the ordinary sign-in, not a redirect of their choosing.
 */
export function selectRedirectUri(
  provider: { readonly redirectUri: string; readonly redirectUris: readonly string[] },
  requestOrigin: string | undefined,
): string {
  if (!requestOrigin) return provider.redirectUri;
  const match = provider.redirectUris.find((uri) => new URL(uri).origin === requestOrigin);
  return match ?? provider.redirectUri;
}

function discordInteractions(env: NodeJS.ProcessEnv): DiscordInteractionsConfig {
  // This used to return disabled for every production deployment, whatever the
  // flag said, because the only limiter in front of a public endpoint was a Map
  // in one process. 066 moves the counter into a row and
  // `createPostgresDiscordRateLimiter` consumes from it, so the budget is one
  // budget however many instances exist -- and the single-process limiter was
  // deleted rather than kept as a fallback, because a fallback that silently
  // weakens the limit is exactly what this block was holding the line against.
  //
  // What remains fail-closed: DiscordModule builds no handler without a
  // database pool, and without one there is nowhere to count.
  if (env.DISCORD_INTERACTIONS_ENABLED !== 'true') return { enabled: false };

  const publicKey = env.DISCORD_INTERACTIONS_PUBLIC_KEY;
  const guildId = env.DISCORD_INTERACTIONS_GUILD_ID;
  const roleIds = String(env.DISCORD_INTERACTIONS_ROLE_IDS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const roleMode = env.DISCORD_INTERACTIONS_ROLE_MODE ?? 'any';

  if (
    publicKey === undefined ||
    !DISCORD_PUBLIC_KEY.test(publicKey) ||
    guildId === undefined ||
    !DISCORD_SNOWFLAKE.test(guildId) ||
    roleIds.length < 1 ||
    roleIds.length > 100 ||
    new Set(roleIds).size !== roleIds.length ||
    roleIds.some((roleId) => !DISCORD_SNOWFLAKE.test(roleId)) ||
    (roleMode !== 'any' && roleMode !== 'all')
  ) {
    return { enabled: false };
  }

  return {
    enabled: true,
    publicKey,
    policy: { guilds: { [guildId]: { requiredRoleIds: roleIds, roleMode } } },
    // Deliberately fixed here rather than exposed as an environment variable:
    // a deployment that can widen its own throttle has no throttle.
    rateLimit: { limit: 5, windowMs: 10_000 },
  };
}

/**
 * The application id a bot token was issued for.
 *
 * A Discord bot token is three dot-separated segments and the first is the
 * application's snowflake in base64url. Reading it back is what lets a
 * deployment refuse a token that belongs to the other one: production names
 * its own DISCORD_APPLICATION_ID, and a test token pasted next to it does not
 * decode to that id. Nothing here logs, returns or compares the token itself.
 */
function botTokenApplicationId(token: string): string | null {
  const segment = token.split('.')[0];
  if (segment === undefined || segment.length === 0 || segment.length > 64) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(segment)) return null;
  try {
    const decoded = Buffer.from(segment, 'base64url').toString('utf8');
    return DISCORD_SNOWFLAKE.test(decoded) ? decoded : null;
  } catch {
    return null;
  }
}

/**
 * Route key to channel id, from `DISCORD_OUTBOX_CHANNEL_ID` plus any extra
 * keys in `DISCORD_OUTBOX_CHANNEL_IDS` (`key=id,key=id`). Returns null when
 * anything is malformed, so a typo disables the worker instead of silently
 * announcing into whichever channel did parse.
 */
function outboxChannels(env: NodeJS.ProcessEnv): Readonly<Record<string, string>> | null {
  const channels: Record<string, string> = {};
  const defaultChannelId = env.DISCORD_OUTBOX_CHANNEL_ID;
  if (defaultChannelId !== undefined && defaultChannelId !== '') {
    if (!DISCORD_SNOWFLAKE.test(defaultChannelId)) return null;
    channels.default = defaultChannelId;
  }
  const extra = String(env.DISCORD_OUTBOX_CHANNEL_IDS ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (extra.length > 16) return null;
  for (const entry of extra) {
    const separator = entry.indexOf('=');
    const key = entry.slice(0, separator);
    const channelId = entry.slice(separator + 1);
    if (
      separator < 1 ||
      !DISCORD_ROUTE_KEY.test(key) ||
      !DISCORD_SNOWFLAKE.test(channelId) ||
      key in channels
    ) {
      return null;
    }
    channels[key] = channelId;
  }
  return Object.keys(channels).length > 0 ? channels : null;
}

function discordOutbox(env: NodeJS.ProcessEnv): DiscordOutboxConfig {
  if (env.DISCORD_OUTBOX_ENABLED !== 'true') {
    return { enabled: false, reason: 'DISCORD_OUTBOX_ENABLED is not true' };
  }

  const botToken = env.DISCORD_BOT_TOKEN ?? '';
  const applicationId = env.DISCORD_APPLICATION_ID ?? '';
  const channels = outboxChannels(env);
  if (!botToken || !DISCORD_SNOWFLAKE.test(applicationId) || !channels) {
    return {
      enabled: false,
      reason: 'DISCORD_BOT_TOKEN, DISCORD_APPLICATION_ID and an outbox channel are all required',
    };
  }

  // The one mistake this check exists for: a token copied from the other
  // deployment, which would post this stack's events into that stack's guild
  // under that stack's bot. The two deployments share no database and no
  // secret, and they must not share a bot either.
  if (botTokenApplicationId(botToken) !== applicationId) {
    return {
      enabled: false,
      reason: 'DISCORD_BOT_TOKEN was not issued for DISCORD_APPLICATION_ID',
    };
  }

  const configured = Number(env.DISCORD_OUTBOX_INTERVAL_MS ?? 5_000);
  return {
    enabled: true,
    botToken,
    applicationId,
    channels,
    // Floor of a second, ceiling of five minutes: below the floor this is a
    // busy loop against Discord's rate limiter, above the ceiling an
    // announcement arrives long after the thing it announces.
    intervalMs:
      Number.isFinite(configured) && configured >= 1_000 && configured <= 300_000
        ? Math.trunc(configured)
        : 5_000,
  };
}

function bounded(raw: string | undefined, fallback: number, low: number, high: number): number {
  const configured = Number(raw ?? fallback);
  return Number.isFinite(configured) && configured >= low && configured <= high
    ? Math.trunc(configured)
    : fallback;
}

function databasePool(env: NodeJS.ProcessEnv): DatabasePoolConfig {
  return {
    // Ten, which is also what `pg` would have used -- the point is that it is
    // now a decision with a ceiling rather than a library default. The cluster
    // allows 100 and five other roles draw on the same budget, so the ceiling
    // is well under it: an API told to hold fifty would starve the reconciler
    // and the nightly backup, and 17.9 exists to prevent exactly that.
    max: bounded(env.DATABASE_POOL_MAX, 10, 1, 40),
    idleTimeoutMillis: bounded(env.DATABASE_POOL_IDLE_TIMEOUT_MS, 10_000, 1_000, 300_000),
    // The one that is not a library default. `pg` waits forever for a free
    // connection, so an exhausted pool turns into requests that never answer
    // and a queue that only grows; five seconds turns it into a 503 the caller
    // can retry, which is the failure the rest of this service is written for.
    connectionTimeoutMillis: bounded(env.DATABASE_POOL_CONNECT_TIMEOUT_MS, 5_000, 1_000, 60_000),
  };
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const production = env.NODE_ENV === 'production';
  const baseUrl = parseUrl(env.APP_BASE_URL ?? 'http://127.0.0.1:3000', 'APP_BASE_URL').toString();
  const allowedOrigins = allowedRedirectOrigins(env);

  const internalToken = env.INTERNAL_API_TOKEN ?? '';
  if (internalToken.length < 32) {
    throw new Error('INTERNAL_API_TOKEN must be at least 32 characters');
  }

  return {
    port: Number(env.PORT ?? 3000),
    baseUrl,
    databaseUrl: env.DATABASE_URL,
    databasePool: databasePool(env),
    production,
    cookieSecure: env.COOKIE_SECURE === undefined ? production : env.COOKIE_SECURE === 'true',
    adsEnabled: env.ADS_ENABLED === 'true',
    // Public indexing stays opt-in. A test URL or a newly connected domain
    // must not become searchable until its canonical host is reviewed.
    seoIndexingEnabled: env.SEO_INDEXING_ENABLED === 'true',
    // Enable only when the last reverse proxy removes client-supplied
    // X-Forwarded-For values and writes its own trusted value.
    trustProxyForwardedFor: env.TRUST_PROXY_X_FORWARDED_FOR === 'true',
    internalToken,
    oauth: {
      discord: oauthProvider({
        name: 'Discord',
        clientId: env.DISCORD_CLIENT_ID,
        clientSecret: env.DISCORD_CLIENT_SECRET,
        redirectUri: env.DISCORD_REDIRECT_URI,
        baseUrl,
        callbackPath: '/auth/discord/callback',
        allowedOrigins,
      }),
      google: oauthProvider({
        // Google stays consistent with Discord: a provider is available only
        // when its complete, same-origin OAuth configuration is present.
        // Requiring a separate enable flag made a valid deployment silently
        // show Google as unavailable when that optional flag was omitted.
        name: 'Google',
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        redirectUri: env.GOOGLE_REDIRECT_URI,
        baseUrl,
        callbackPath: '/auth/google/callback',
        allowedOrigins,
      }),
    },
    discordInteractions: discordInteractions(env),
    discordOutbox: discordOutbox(env),
  };
}
