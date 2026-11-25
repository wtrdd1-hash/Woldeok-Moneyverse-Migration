import { describe, expect, it } from 'vitest';
import { isSameOriginFinanceMutation } from './finance-mutation-origin';

/**
 * QA 2026-11-25: production also serves www.easy-scraping.com without a
 * redirect, so a member on www had every guarded write refused (403).
 */
const proxied = (origin: string, host: string) => new Request('http://127.0.0.1:55478/api/transfers/p2p', {
  method: 'POST', headers: { origin, host, 'x-forwarded-host': host, 'sec-fetch-site': 'same-origin' },
});

describe('same-origin guard behind the proxy', () => {
  it('accepts the www production host', () => {
    expect(isSameOriginFinanceMutation(proxied('https://www.easy-scraping.com', 'www.easy-scraping.com'))).toBe(true);
  });
  it('still refuses a cross-host pairing', () => {
    expect(isSameOriginFinanceMutation(proxied('https://www.easy-scraping.com', 'easy-scraping.com'))).toBe(false);
    expect(isSameOriginFinanceMutation(proxied('https://evil.example', 'evil.example'))).toBe(false);
  });
});
