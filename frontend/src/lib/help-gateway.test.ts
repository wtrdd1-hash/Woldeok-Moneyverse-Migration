import { describe, expect, it } from 'vitest';
import { addAppJsonCompatibility, appGatewayPath } from './app-gateway';

describe('verified help Android app API boundary', () => {
  it('exposes only public help read routes', () => {
    expect(appGatewayPath(['help','categories'])).toBe('/api/v1/help/categories');
    expect(appGatewayPath(['help','search'])).toBe('/api/v1/help/search');
    expect(appGatewayPath(['help','articles','ko','account-login'])).toBe('/api/v1/help/articles/ko/account-login');
    expect(appGatewayPath(['help','articles','ko','account-login','status'])).toBe('/api/v1/help/articles/ko/account-login/status');
    expect(appGatewayPath(['help','articles','ko','account-login','admin'])).toBeNull();
    expect(appGatewayPath(['help','admin','drafts'])).toBeNull();
    expect(appGatewayPath(['admin','help','articles'])).toBeNull();
  });
});

describe('Android public evidence freshness response', () => {
  it('preserves the ISO review deadline and camelCase compatibility alias', () => {
    const date = '2030-01-02T03:04:00.000Z';
    expect(addAppJsonCompatibility({ reviewed_until: date })).toEqual({
      reviewed_until: date,
      reviewedUntil: date,
    });
  });
});
