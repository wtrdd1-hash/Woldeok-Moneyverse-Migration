import { describe, expect, it } from 'vitest';
import { loadConfig, selectRedirectUri } from './config';

const MINIMAL = {
  APP_BASE_URL: 'http://127.0.0.1:3000',
  INTERNAL_API_TOKEN: 'x'.repeat(32),
} satisfies NodeJS.ProcessEnv;

describe('loadConfig', () => {
  it('defaults the port to 3000', () => {
    expect(loadConfig({ ...MINIMAL }).port).toBe(3000);
  });

  it('accepts plain HTTP for a loopback base URL', () => {
    expect(loadConfig({ ...MINIMAL }).baseUrl).toBe('http://127.0.0.1:3000/');
  });

  it('rejects plain HTTP for a non-loopback base URL', () => {
    expect(() => loadConfig({ ...MINIMAL, APP_BASE_URL: 'http://example.com' })).toThrow(
      /absolute HTTPS URL/,
    );
  });

  it('rejects a base URL carrying credentials', () => {
    expect(() => loadConfig({ ...MINIMAL, APP_BASE_URL: 'https://a:b@example.com' })).toThrow(
      /absolute HTTPS URL/,
    );
  });

  it('rejects a base URL carrying a query string', () => {
    expect(() => loadConfig({ ...MINIMAL, APP_BASE_URL: 'https://example.com/?a=1' })).toThrow(
      /absolute HTTPS URL/,
    );
  });

  it('requires an internal API token of at least 32 characters', () => {
    expect(() => loadConfig({ ...MINIMAL, INTERNAL_API_TOKEN: 'short' })).toThrow(
      /INTERNAL_API_TOKEN/,
    );
  });

  it('defaults cookieSecure to the production flag', () => {
    expect(
      loadConfig({ ...MINIMAL, NODE_ENV: 'production', APP_BASE_URL: 'https://example.com' })
        .cookieSecure,
    ).toBe(true);
    expect(loadConfig({ ...MINIMAL }).cookieSecure).toBe(false);
  });

  it('keeps SEO indexing opt-in', () => {
    expect(loadConfig({ ...MINIMAL }).seoIndexingEnabled).toBe(false);
    expect(loadConfig({ ...MINIMAL, SEO_INDEXING_ENABLED: 'true' }).seoIndexingEnabled).toBe(true);
  });

  it('keeps proxy header trust opt-in', () => {
    expect(loadConfig({ ...MINIMAL }).trustProxyForwardedFor).toBe(false);
  });

  it('disables an OAuth provider whose callback is not same-origin', () => {
    const config = loadConfig({
      ...MINIMAL,
      DISCORD_CLIENT_ID: 'id',
      DISCORD_CLIENT_SECRET: 'secret',
      DISCORD_REDIRECT_URI: 'https://elsewhere.example/auth/discord/callback',
    });
    expect(config.oauth.discord.enabled).toBe(false);
  });

  it('enables an OAuth provider with a complete same-origin configuration', () => {
    const config = loadConfig({
      ...MINIMAL,
      DISCORD_CLIENT_ID: 'id',
      DISCORD_CLIENT_SECRET: 'secret',
      DISCORD_REDIRECT_URI: 'http://127.0.0.1:3000/auth/discord/callback',
    });
    expect(config.oauth.discord.enabled).toBe(true);
  });

  /**
   * This asserted the opposite until 066. The endpoint was held back from
   * production because the only limiter was a Map in one process; the counter
   * is a row now, so the flag is what decides.
   */
  it('enables Discord interactions in production once they are configured', () => {
    const config = loadConfig({
      ...MINIMAL,
      NODE_ENV: 'production',
      APP_BASE_URL: 'https://example.com',
      DISCORD_INTERACTIONS_ENABLED: 'true',
      DISCORD_INTERACTIONS_PUBLIC_KEY: 'a'.repeat(64),
      DISCORD_INTERACTIONS_GUILD_ID: '1234567890123456',
      DISCORD_INTERACTIONS_ROLE_IDS: '1234567890123456',
    });
    expect(config.discordInteractions.enabled).toBe(true);
  });

  it('still disables Discord interactions on a malformed guild or role', () => {
    const config = loadConfig({
      ...MINIMAL,
      DISCORD_INTERACTIONS_ENABLED: 'true',
      DISCORD_INTERACTIONS_PUBLIC_KEY: 'a'.repeat(64),
      DISCORD_INTERACTIONS_GUILD_ID: 'our-server',
      DISCORD_INTERACTIONS_ROLE_IDS: '1234567890123456',
    });
    expect(config.discordInteractions.enabled).toBe(false);
  });
});

/**
 * A bot token's first segment is the application id in base64url. Nothing
 * secret here: the id is public, and the other two segments are placeholders
 * that no Discord API would accept.
 */
const APPLICATION_ID = '1234567890123456';
function fakeBotTokenFor(applicationId: string): string {
  return `${Buffer.from(applicationId, 'utf8').toString('base64url')}.notatoken.notasignature`;
}

const OUTBOX = {
  DISCORD_OUTBOX_ENABLED: 'true',
  DISCORD_APPLICATION_ID: APPLICATION_ID,
  DISCORD_BOT_TOKEN: fakeBotTokenFor(APPLICATION_ID),
  DISCORD_OUTBOX_CHANNEL_ID: '9876543210987654',
} satisfies NodeJS.ProcessEnv;

describe('loadConfig: the database pool', () => {
  it('bounds the pool without being told to', () => {
    expect(loadConfig({ ...MINIMAL }).databasePool).toEqual({
      max: 10,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
    });
  });

  it('takes a ceiling an operator sets', () => {
    expect(loadConfig({ ...MINIMAL, DATABASE_POOL_MAX: '25' }).databasePool.max).toBe(25);
  });

  it('refuses a ceiling that would take the whole cluster', () => {
    expect(loadConfig({ ...MINIMAL, DATABASE_POOL_MAX: '400' }).databasePool.max).toBe(10);
  });

  it('refuses a ceiling of zero, which would answer nothing at all', () => {
    expect(loadConfig({ ...MINIMAL, DATABASE_POOL_MAX: '0' }).databasePool.max).toBe(10);
  });

  // compose.yml passes these through as `${DATABASE_POOL_MAX:-}`, so an
  // unconfigured host sends the empty string rather than nothing at all.
  // `'' ?? fallback` keeps the empty string; the bound is what rejects it.
  it('treats an empty setting as unset', () => {
    expect(loadConfig({ ...MINIMAL, DATABASE_POOL_MAX: '' }).databasePool).toEqual({
      max: 10,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
    });
  });

  it('refuses a ceiling that is not a number', () => {
    expect(loadConfig({ ...MINIMAL, DATABASE_POOL_MAX: 'lots' }).databasePool.max).toBe(10);
  });

  // The wait is the setting that matters: without a ceiling `pg` queues
  // forever, and a saturated pool stops answering instead of answering 503.
  it('never waits forever for a connection', () => {
    const forever = loadConfig({ ...MINIMAL, DATABASE_POOL_CONNECT_TIMEOUT_MS: '0' });
    expect(forever.databasePool.connectionTimeoutMillis).toBe(5_000);
  });
});

describe('loadConfig: the Discord outbox', () => {
  it('is off by default, and says which switch is off', () => {
    const outbox = loadConfig({ ...MINIMAL }).discordOutbox;
    expect(outbox.enabled).toBe(false);
    expect(outbox.enabled === false && outbox.reason).toMatch(/DISCORD_OUTBOX_ENABLED/);
  });

  it('runs with a token, an application and a channel', () => {
    const outbox = loadConfig({ ...MINIMAL, ...OUTBOX }).discordOutbox;
    expect(outbox.enabled).toBe(true);
    expect(outbox.enabled === true && outbox.channels).toEqual({
      default: '9876543210987654',
      logs: '9876543210987654',
    });
    expect(outbox.enabled === true && outbox.intervalMs).toBe(5_000);
  });

  /**
   * The mistake worth making impossible: the other deployment's token, which
   * would post this stack's events into that stack's guild. The two stacks
   * share no database and no secret, and they must not share a bot.
   */
  it('refuses a bot token issued for a different application', () => {
    const outbox = loadConfig({
      ...MINIMAL,
      ...OUTBOX,
      DISCORD_BOT_TOKEN: fakeBotTokenFor('6543210987654321'),
    }).discordOutbox;
    expect(outbox.enabled).toBe(false);
    expect(outbox.enabled === false && outbox.reason).toMatch(/not issued for/);
  });

  it('never puts the token in the reason it gives', () => {
    const outbox = loadConfig({
      ...MINIMAL,
      ...OUTBOX,
      DISCORD_BOT_TOKEN: fakeBotTokenFor('6543210987654321'),
    }).discordOutbox;
    expect(outbox.enabled === false && outbox.reason).not.toContain('notasignature');
  });

  it('reads extra route keys, and refuses the lot when one is malformed', () => {
    const withRoutes = loadConfig({
      ...MINIMAL,
      ...OUTBOX,
      DISCORD_OUTBOX_CHANNEL_IDS: 'alerts=1111111111111111,ops=2222222222222222',
    }).discordOutbox;
    expect(withRoutes.enabled === true && withRoutes.channels).toEqual({
      default: '9876543210987654',
      alerts: '1111111111111111',
      ops: '2222222222222222',
      logs: '9876543210987654',
    });

    const withTypo = loadConfig({
      ...MINIMAL,
      ...OUTBOX,
      DISCORD_OUTBOX_CHANNEL_IDS: 'alerts=#general',
    }).discordOutbox;
    expect(withTypo.enabled).toBe(false);
  });

  it('clamps an interval that would spin against Discord', () => {
    const tooFast = loadConfig({
      ...MINIMAL,
      ...OUTBOX,
      DISCORD_OUTBOX_INTERVAL_MS: '10',
    }).discordOutbox;
    expect(tooFast.enabled === true && tooFast.intervalMs).toBe(5_000);
  });
});

describe('multiple registered origins', () => {
  const base = {
    DISCORD_CLIENT_ID: 'id',
    DISCORD_CLIENT_SECRET: 'secret',
    APP_BASE_URL: 'https://easy-scraping.com',
    DISCORD_REDIRECT_URI: 'https://easy-scraping.com/auth/discord/callback',
    INTERNAL_API_TOKEN: 'x'.repeat(32),
  };

  const discordOf = (env: NodeJS.ProcessEnv) => {
    const provider = loadConfig(env).oauth.discord;
    if (!provider.enabled) throw new Error('expected the provider to be enabled');
    return provider;
  };

  it('registers only the canonical URI when no others are named', () => {
    expect(discordOf({ ...base }).redirectUris).toEqual([
      'https://easy-scraping.com/auth/discord/callback',
    ]);
  });

  it('adds the callback path to each additional origin, canonical first', () => {
    expect(
      discordOf({
        ...base,
        OAUTH_ALLOWED_REDIRECT_URIS: 'https://weoldeog.com, https://www.easy-scraping.com',
      }).redirectUris,
    ).toEqual([
      'https://easy-scraping.com/auth/discord/callback',
      'https://weoldeog.com/auth/discord/callback',
      'https://www.easy-scraping.com/auth/discord/callback',
    ]);
  });

  it('takes only the origin from an entry, never a path it carries', () => {
    // An operator naming a path would otherwise redirect sign-ins somewhere
    // the router does not serve.
    expect(
      discordOf({ ...base, OAUTH_ALLOWED_REDIRECT_URIS: 'https://weoldeog.com/somewhere/else' })
        .redirectUris,
    ).toContain('https://weoldeog.com/auth/discord/callback');
  });

  it('refuses to start on an entry that is not an absolute HTTPS URL', () => {
    // This list decides where a session cookie may be issued. Starting with
    // one of them quietly dropped is worse than not starting.
    expect(() => loadConfig({ ...base, OAUTH_ALLOWED_REDIRECT_URIS: 'weoldeog.com' })).toThrow(
      /OAUTH_ALLOWED_REDIRECT_URIS/,
    );
  });

  it('never registers an origin nobody named', () => {
    const uris = discordOf({ ...base, OAUTH_ALLOWED_REDIRECT_URIS: 'https://weoldeog.com' })
      .redirectUris;
    expect(uris).not.toContain('https://test.easy-scraping.com/auth/discord/callback');
  });
});

describe('selectRedirectUri', () => {
  const provider = {
    redirectUri: 'https://easy-scraping.com/auth/discord/callback',
    redirectUris: [
      'https://easy-scraping.com/auth/discord/callback',
      'https://weoldeog.com/auth/discord/callback',
    ],
  };

  it('keeps the visitor on the registered origin they arrived at', () => {
    expect(selectRedirectUri(provider, 'https://weoldeog.com')).toBe(
      'https://weoldeog.com/auth/discord/callback',
    );
  });

  it('falls back to the canonical URI for an origin nobody registered', () => {
    // A forged x-public-origin buys the ordinary sign-in, not a redirect of
    // the caller's choosing.
    expect(selectRedirectUri(provider, 'https://attacker.example')).toBe(provider.redirectUri);
  });

  it('falls back when no origin was relayed at all', () => {
    expect(selectRedirectUri(provider, undefined)).toBe(provider.redirectUri);
  });
});
