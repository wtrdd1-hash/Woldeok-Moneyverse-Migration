import { describe, expect, it } from 'vitest';
import { corsPolicy } from './cors-policy';

describe('corsPolicy', () => {
  it('accepts only the configured public origin in production', () => {
    const policy = corsPolicy({ baseUrl: 'https://easy-scraping.com', production: true });
    expect(policy.allowsOrigin('https://easy-scraping.com')).toBe(true);
    expect(policy.allowsOrigin('http://localhost:3000')).toBe(false);
    expect(policy.allowsOrigin('http://127.0.0.1:3000')).toBe(false);
  });

  it('keeps loopback origins available outside production', () => {
    const policy = corsPolicy({ baseUrl: 'http://127.0.0.1:3000', production: false });
    expect(policy.allowsOrigin('http://127.0.0.1:3000')).toBe(true);
    expect(policy.allowsOrigin('http://localhost:3000')).toBe(true);
  });

  it('never browser-authorizes trusted edge identity headers', () => {
    const policy = corsPolicy({ baseUrl: 'https://easy-scraping.com', production: true });
    expect(policy.allowedHeaders.map((header) => header.toLowerCase())).not.toContain('cf-connecting-ip');
    expect(policy.allowedHeaders.map((header) => header.toLowerCase())).not.toContain('x-forwarded-for');
  });
});
