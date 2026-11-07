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
const ORIGINAL_PUBLIC_ADS = process.env.NEXT_PUBLIC_ADS_ENABLED;

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
  if (ORIGINAL_PUBLIC_ADS === undefined) delete process.env.NEXT_PUBLIC_ADS_ENABLED;
  else process.env.NEXT_PUBLIC_ADS_ENABLED = ORIGINAL_PUBLIC_ADS;
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

  it('admits the reviewed AdSense origins by default', async () => {
    delete process.env.ADS_ENABLED;
    delete process.env.NEXT_PUBLIC_ADS_ENABLED;
    const csp = directives((await headersFor('https://test.example.com')).get('content-security-policy')!);
    expect(csp.get('script-src')).toContain('https://pagead2.googlesyndication.com');
    expect(csp.get('script-src')).toContain('https://*.adtrafficquality.google');
    expect(csp.get('frame-src')).toBe(
      'https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://adtrafficquality.google https://*.adtrafficquality.google https://www.google.com',
    );
    expect(csp.get('connect-src')).toContain('https://googleads.g.doubleclick.net');
  });

  it('removes all AdSense origins when advertising is explicitly disabled', async () => {
    process.env.ADS_ENABLED = 'false';
    const csp = directives((await headersFor('https://test.example.com')).get('content-security-policy')!);
    expect(csp.get('script-src')).not.toContain('https://pagead2.googlesyndication.com');
    expect(csp.get('script-src')).not.toContain('https://*.adtrafficquality.google');
    expect(csp.get('frame-src')).toBe("'none'");
    expect(csp.get('connect-src')).not.toContain('https://googleads.g.doubleclick.net');
  });

  it('admits no other third-party script origin while ads are disabled', async () => {
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
    expect(csp.get('script-src')).toContain('https://*.adtrafficquality.google');
    expect(csp.get('frame-src')).toBe(
      'https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://adtrafficquality.google https://*.adtrafficquality.google https://www.google.com',
    );
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
    expect((await headersFor('https://test.example.com')).get('x-robots-tag')).toBe(
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    );
  });
});


describe('authenticated HTML route privacy at the HTTP edge', () => {
  const privateRoots = [
    'account', 'account-deletion', 'admin', 'wallet', 'dashboard', 'bank',
    'chat', 'calendar', 'inventory', 'progression', 'quests', 'seasons',
    'support', 'businesses', 'arcade', 'clubs', 'collections', 'marketplace',
    'work', 'profile', 'developer', 'login', 'shop/catalog',
    'stocks/alerts', 'stocks/compare', 'stocks/derivatives',
    'stocks/history', 'stocks/portfolio', 'stocks/watchlist', 'gallery/submit',
  ];

  it('overrides permissive global indexing and caching on protected paths and all supported locale aliases', async () => {
    process.env.SEO_INDEXING_ENABLED = 'true';
    const groups = await config.headers!();
    const globalIndex = groups.findIndex((group) => group.source === '/:path*');
    expect(globalIndex).toBe(0);
    for (const root of privateRoots) {
      for (const source of [`/${root}/:path*`, `/:locale(ko|en|ja|zh|vi)/${root}/:path*`]) {
        const index = groups.findIndex((group) => group.source === source);
        expect(index, `Missing private header policy for ${source}`).toBeGreaterThan(globalIndex);
        const headers = new Map(groups[index]!.headers.map((header) => [header.key.toLowerCase(), header.value]));
        expect(headers.get('x-robots-tag'), source).toBe('noindex, nofollow');
        expect(headers.get('cache-control'), source).toBe('private, no-store');
        expect(headers.get('referrer-policy'), source).toBe('no-referrer');
      }
    }
  });

  it('does not add private overrides to public home, blog, market and shop landing paths', async () => {
    process.env.SEO_INDEXING_ENABLED = 'true';
    const groups = await config.headers!();
    const privateSources = groups.slice(1).map((group) => group.source);
    expect(privateSources).not.toContain('/:path*');
    for (const publicPath of ['/blog/:path*', '/stocks/:path*', '/shop/:path*', '/guide/:path*']) {
      expect(privateSources).not.toContain(publicPath);
    }
    const globalHeaders = new Map(groups[0]!.headers.map((header) => [header.key.toLowerCase(), header.value]));
    expect(globalHeaders.get('x-robots-tag')).toContain('index, follow');
  });
});
