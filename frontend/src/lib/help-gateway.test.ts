import { describe, expect, it } from 'vitest';
import { appGatewayPath } from './app-gateway';

describe('verified help Android app API boundary', () => {
  it('exposes only public help read routes', () => {
    expect(appGatewayPath(['help','categories'])).toBe('/api/v1/help/categories');
    expect(appGatewayPath(['help','search'])).toBe('/api/v1/help/search');
    expect(appGatewayPath(['help','articles','ko','account-login'])).toBe('/api/v1/help/articles/ko/account-login');
    expect(appGatewayPath(['help','admin','drafts'])).toBeNull();
    expect(appGatewayPath(['admin','help','articles'])).toBeNull();
  });
});

describe('Android verified bilingual help contract', () => {
  it('keeps public POST help search allowlisted for opt-in fallback without exposing private routes', () => {
    expect(appGatewayPath(['help','search'])).toBe('/api/v1/help/search');
    expect(appGatewayPath(['help','feedback','receipts'])).toBeNull();
    expect(appGatewayPath(['help','admin','feedback'])).toBeNull();
  });
});
