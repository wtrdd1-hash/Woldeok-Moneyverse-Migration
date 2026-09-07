import { describe, expect, it } from 'vitest';
import { appGatewayOrigin, appGatewayPath } from './app-gateway';

describe('appGatewayPath', () => {
  it('allows member-facing API groups', () => {
    expect(appGatewayPath(['wallet', 'transfers'])).toBe('/api/v1/wallet/transfers');
    expect(appGatewayPath(['auth', 'session'])).toBe('/api/v1/auth/session');
    expect(appGatewayPath(['stocks'])).toBe('/api/v1/stocks');
  });

  it('refuses internal and traversal paths', () => {
    expect(appGatewayPath(['admin', 'users'])).toBeNull();
    expect(appGatewayPath(['integrations', 'discord'])).toBeNull();
    expect(appGatewayPath(['wallet', '..', 'admin'])).toBeNull();
    expect(appGatewayPath([])).toBeNull();
  });
});

describe('appGatewayOrigin', () => {
  it('derives the public origin from trusted proxy headers', () => {
    const headers = new Headers({ 'x-forwarded-host': 'easy-scraping.com', 'x-forwarded-proto': 'https' });
    expect(appGatewayOrigin(headers)).toBe('https://easy-scraping.com');
  });

  it('rejects a malformed host', () => {
    expect(appGatewayOrigin(new Headers())).toBeNull();
  });
});
