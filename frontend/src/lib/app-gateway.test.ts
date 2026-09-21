import { describe, expect, it } from 'vitest';
import {
  APP_API_CONTRACT_VERSION,
  APP_API_GROUPS,
  APP_API_REQUEST_HEADERS,
  APP_API_RESPONSE_HEADERS,
  addAppJsonCompatibility,
  appApiContract,
  appendAppContractHeaders,
  appGatewayOrigin,
  appGatewayPath,
  isJsonMediaType,
} from './app-gateway';

describe('appGatewayPath', () => {
  it('allows member-facing API groups', () => {
    expect(appGatewayPath(['wallet', 'transfers'])).toBe('/api/v1/wallet/transfers');
    expect(appGatewayPath(['auth', 'session'])).toBe('/api/v1/auth/session');
    expect(appGatewayPath(['stocks'])).toBe('/api/v1/stocks');
    expect(appGatewayPath(['media', 'profile', 'avatar.webp'])).toBe('/media/profile/avatar.webp');
    expect(appGatewayPath(['auth', 'google', 'authorize'])).toBe('/auth/google/authorize');
    expect(appGatewayPath(['auth', 'discord', 'callback'])).toBe('/auth/discord/callback');
  });

  it('refuses internal and traversal paths', () => {
    expect(appGatewayPath(['admin', 'me'])).toBe('/api/v1/admin/me');
    expect(appGatewayPath(['integrations', 'discord'])).toBeNull();
    expect(appGatewayPath(['wallet', '..', 'admin'])).toBeNull();
    expect(appGatewayPath([])).toBeNull();
  });
});

describe('appGatewayOrigin', () => {
  it('derives the public origin from deployment configuration', () => {
    const headers = new Headers({ 'x-forwarded-host': 'easy-scraping.com', 'x-forwarded-proto': 'https' });
    expect(appGatewayOrigin(headers, 'https://easy-scraping.com')).toBe('https://easy-scraping.com');
  });

  it('fails closed when the public base URL is missing', () => {
    expect(appGatewayOrigin(new Headers(), '')).toBeNull();
  });

  it('does not trust spoofed forwarded host or protocol for public URLs', () => {
    const headers = new Headers({
      host: 'attacker.example',
      'x-forwarded-host': 'attacker.example',
      'x-forwarded-proto': 'http',
    });
    expect(appGatewayOrigin(headers, 'https://easy-scraping.com')).toBe('https://easy-scraping.com');
  });

  it('fails closed when the configured public base URL is invalid', () => {
    expect(appGatewayOrigin(new Headers({ host: 'easy-scraping.com' }), 'javascript:alert(1)')).toBeNull();
  });
});


describe('app API compatibility contract', () => {
  it('keeps every documented app group in the gateway allow-list', () => {
    expect(APP_API_GROUPS).toEqual([
      'account', 'activity', 'admin', 'auth', 'bank', 'banking', 'board', 'businesses',
      'casino', 'chat', 'clubs', 'content', 'early-game', 'engagement', 'media', 'photos', 'privacy',
      'profile', 'progression', 'rewards', 'seasons', 'game-clock', 'shop', 'spaces', 'stocks', 'support', 'wallet', 'work',
    ]);
  });

  it('declares request and response headers native clients rely on', () => {
    expect(APP_API_REQUEST_HEADERS).toContain('accept-language');
    expect(APP_API_REQUEST_HEADERS).toContain('range');
    expect(APP_API_REQUEST_HEADERS).toContain('if-none-match');
    expect(APP_API_RESPONSE_HEADERS).toContain('retry-after');
    expect(APP_API_RESPONSE_HEADERS).toContain('etag');
    expect(APP_API_RESPONSE_HEADERS).toContain('content-range');
    expect(APP_API_RESPONSE_HEADERS).toContain('x-ratelimit-remaining');
  });

  it('stamps every app response with stable API and contract versions', () => {
    const headers = appendAppContractHeaders(new Headers());
    expect(headers.get('x-moneyverse-api-version')).toBe('1');
    expect(headers.get('x-moneyverse-contract-version')).toBe(APP_API_CONTRACT_VERSION);
    expect(headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('publishes machine-readable client rules without exposing private backend details', () => {
    const contract = appApiContract('https://easy-scraping.com');
    expect(contract.baseUrl).toBe('https://easy-scraping.com/app-api/v1');
    expect(contract.auth.persistentCookieJarRequired).toBe(true);
    expect(contract.auth.csrfHeader).toBe('x-csrf-token');
    expect(contract.errors.mediaType).toBe('application/problem+json');
    expect(contract.nullHandling.neverRenderLiteralNull).toBe(true);
    expect(JSON.stringify(contract)).not.toContain('INTERNAL_API_TOKEN');
    expect(JSON.stringify(contract)).not.toContain('3020');
  });

  it('adds camelCase aliases recursively without removing legacy keys', () => {
    const value = addAppJsonCompatibility({
      daily_bet_limit: '1000',
      nested_rows: [{ joined_at: '2026-09-14T00:00:00.000Z', existingValue: 7 }],
      existing_value: 1,
      existingValue: 2,
    }) as Record<string, unknown>;
    expect(value.daily_bet_limit).toBe('1000');
    expect(value.dailyBetLimit).toBe('1000');
    expect(value.nestedRows).toEqual([
      { joined_at: '2026-09-14T00:00:00.000Z', joinedAt: '2026-09-14T00:00:00.000Z', existingValue: 7 },
    ]);
    expect(value.existingValue).toBe(2);
  });

  it('adds released mobile business price and profit aliases without removing canonical fields', () => {
    const value = addAppJsonCompatibility({
      businessTypes: [{
        id: 'business-1',
        name: '중고 판매대',
        purchaseCost: '3000',
        dailyRevenue: '170',
        dailyOperatingCost: '50',
      }],
    }) as { businessTypes: Array<Record<string, unknown>> };
    const business = value.businessTypes[0]!;
    expect(business.purchaseCost).toBe('3000');
    expect(business.price).toBe('3000');
    expect(business.purchasePrice).toBe('3000');
    expect(business.expectedProfit).toBe('120');
    expect(business.dailyProfit).toBe('120');
    expect(business.netProfit).toBe('120');
    expect(business.profit).toBe('120');
  });

  it('does not overwrite explicit semantic business fields from the backend', () => {
    const value = addAppJsonCompatibility({
      purchaseCost: '3000',
      dailyRevenue: '170',
      dailyOperatingCost: '50',
      price: 'custom',
      expectedProfit: 'custom-profit',
    }) as Record<string, unknown>;
    expect(value.price).toBe('custom');
    expect(value.expectedProfit).toBe('custom-profit');
  });

  it('recognises normal JSON and RFC problem JSON media types only', () => {
    expect(isJsonMediaType('application/json; charset=utf-8')).toBe(true);
    expect(isJsonMediaType('application/problem+json')).toBe(true);
    expect(isJsonMediaType('image/png')).toBe(false);
    expect(isJsonMediaType(null)).toBe(false);
  });

});
