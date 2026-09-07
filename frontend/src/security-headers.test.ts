import { afterEach, describe, expect, it } from 'vitest';
import config from '../next.config';

/**
 * The security headers are a policy, and a policy nobody reads back is one
 * that drifts. These assertions are the parts that would be a real change if
 * they moved: an origin gaining permission to run scripts, a directive that
 * bounds the damage of an injection quietly disappearing, or the indexing
 * gate opening on an environment that never asked for it.
 */

const ORIGINAL_BASE = process.env.APP_BASE_URL;
const ORIGINAL_INDEXING = process.env.SEO_INDEXING_ENABLED;
const ORIGINAL_ADS = process.env.ADS_ENABLED;

async function headersFor(base: string): Promise<Map<string, string>> {
  process.env.APP_BASE_URL = base;
  const groups = await config.headers!();
  const group = groups[0]!;
  return new Map(group.headers.map((header) => [header.key, header.value]));
}

const directives = (csp: string): Map<string, string> =>
  new Map(
    csp.split('; ').map((directive) => {
      const space = directive.indexOf(' ');
      return space === -1
        ? ([directive, ''] as const)
        : ([directive.slice(0, space), directive.slice(space + 1)] as const);
    }),
  );

afterEach(() => {
  if (ORIGINAL_BASE === undefined) delete process.env.APP_BASE_URL;
  else process.env.APP_BASE_URL = ORIGINAL_BASE;
  if (ORIGINAL_INDEXING === undefined) delete process.env.SEO_INDEXING_ENABLED;
  else process.env.SEO_INDEXING_ENABLED = ORIGINAL_INDEXING;
  if (ORIGINAL_ADS === undefined) delete process.env.ADS_ENABLED;
  else process.env.ADS_ENABLED = ORIGINAL_ADS;
});

describe('security headers', () => {
  it('names the socket origin derived from the base URL', async () => {
    const csp = directives((await headersFor('https://test.example.com')).get('content-security-policy')!);
    expect(csp.get('connect-src')).toContain('wss://test.example.com');
  });

  it('lets Cloudflare serve its beacon and receive the measurement', async () => {
    const csp = directives((await headersFor('https://test.example.com')).get('content-security-policy')!);
    expect(csp.get('script-src')).toContain('https://static.cloudflareinsights.com');
    expect(csp.get('connect-src')).toContain('https://cloudflareinsights.com');
  });

  it('admits no other third-party script origin', async () => {
    process.env.ADS_ENABLED = 'false';
    const csp = directives((await headersFor('https://test.example.com')).get('content-security-policy')!);
    expect(csp.get('script-src')!.split(' ').sort()).toEqual([
      "'self'",
      "'unsafe-inline'",
      'https://static.cloudflareinsights.com',
    ]);
  });

  it('admits only the AdSense origins when advertising is enabled', async () => {
    process.env.ADS_ENABLED = 'true';
    const csp = directives((await headersFor('https://test.example.com')).get('content-security-policy')!);
    expect(csp.get('script-src')).toContain('https://pagead2.googlesyndication.com');
    expect(csp.get('frame-src')).toBe('https://googleads.g.doubleclick.net https://tpc.googlesyndication.com');
    expect(csp.get('connect-src')).toContain('https://googleads.g.doubleclick.net');
    expect(csp.get('connect-src')).toContain('https://*.adtrafficquality.google');
  });

  it('keeps the directives that bound an injection', async () => {
    const csp = directives((await headersFor('https://test.example.com')).get('content-security-policy')!);
    expect(csp.get('default-src')).toBe("'self'");
    expect(csp.get('base-uri')).toBe("'self'");
    expect(csp.get('object-src')).toBe("'none'");
    expect(csp.get('frame-ancestors')).toBe("'none'");
    expect(csp.get('form-action')).toBe("'self'");
  });

  it('refuses indexing unless the environment asks for it', async () => {
    process.env.SEO_INDEXING_ENABLED = 'false';
    expect((await headersFor('https://test.example.com')).get('x-robots-tag')).toBe('noindex, nofollow');

    process.env.SEO_INDEXING_ENABLED = 'true';
    expect((await headersFor('https://test.example.com')).has('x-robots-tag')).toBe(false);
  });
});
