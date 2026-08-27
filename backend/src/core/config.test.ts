import { describe, expect, it } from 'vitest';
import { loadConfig } from './config';

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

  it('keeps Discord interactions disabled in production', () => {
    const config = loadConfig({
      ...MINIMAL,
      NODE_ENV: 'production',
      APP_BASE_URL: 'https://example.com',
      DISCORD_INTERACTIONS_ENABLED: 'true',
      DISCORD_INTERACTIONS_PUBLIC_KEY: 'a'.repeat(64),
      DISCORD_INTERACTIONS_GUILD_ID: '1234567890123456',
      DISCORD_INTERACTIONS_ROLE_IDS: '1234567890123456',
    });
    expect(config.discordInteractions.enabled).toBe(false);
  });
});
