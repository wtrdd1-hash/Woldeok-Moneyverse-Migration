const LOCAL_HTTP_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]']);
const DISCORD_PUBLIC_KEY = /^[0-9a-f]{64}$/i;
const DISCORD_SNOWFLAKE = /^\d{16,22}$/;

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
      readonly redirectUri: string;
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
      readonly rateLimit: {
        readonly limit: number;
        readonly windowMs: number;
        readonly maxEntries: number;
      };
    };

export interface AppConfig {
  readonly port: number;
  readonly baseUrl: string;
  readonly databaseUrl: string | undefined;
  readonly production: boolean;
  readonly cookieSecure: boolean;
  readonly adsEnabled: boolean;
  readonly seoIndexingEnabled: boolean;
  readonly trustProxyForwardedFor: boolean;
  readonly internalToken: string;
  readonly oauth: { readonly discord: OAuthProviderConfig; readonly google: OAuthProviderConfig };
  readonly discordInteractions: DiscordInteractionsConfig;
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
}): OAuthProviderConfig {
  const { clientId, clientSecret, redirectUri, name, baseUrl, callbackPath } = options;
  if (!clientId || !clientSecret || !redirectUri) return { enabled: false };
  const callbackUrl = parseUrl(redirectUri, `${name} redirect URI`);
  const applicationUrl = new URL(baseUrl);
  if (callbackUrl.origin !== applicationUrl.origin) return { enabled: false };
  if (callbackUrl.pathname !== callbackPath) return { enabled: false };
  return { enabled: true, clientId, clientSecret, redirectUri: callbackUrl.toString() };
}

function discordInteractions(
  env: NodeJS.ProcessEnv,
  production: boolean,
): DiscordInteractionsConfig {
  // The bundled limiter is intentionally single-process only. Keep the public
  // endpoint unavailable in production until a shared, atomic limiter is
  // provided and reviewed; test deployments may opt in with exact IDs.
  if (env.DISCORD_INTERACTIONS_ENABLED !== 'true' || production) return { enabled: false };

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
    // Deliberately fixed here. Production requires a separate shared limiter
    // rather than an environment switch that weakens limits.
    rateLimit: { limit: 5, windowMs: 10_000, maxEntries: 10_000 },
  };
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const production = env.NODE_ENV === 'production';
  const baseUrl = parseUrl(env.APP_BASE_URL ?? 'http://127.0.0.1:3000', 'APP_BASE_URL').toString();

  const internalToken = env.INTERNAL_API_TOKEN ?? '';
  if (internalToken.length < 32) {
    throw new Error('INTERNAL_API_TOKEN must be at least 32 characters');
  }

  return {
    port: Number(env.PORT ?? 3000),
    baseUrl,
    databaseUrl: env.DATABASE_URL,
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
      }),
    },
    discordInteractions: discordInteractions(env, production),
  };
}
