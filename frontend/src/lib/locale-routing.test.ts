import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const proxySource = readFileSync(
  path.join(process.cwd(), 'src/proxy.ts'),
  'utf8',
);

describe('Multilingual URL Prefix & GeoIP Routing in proxy.ts (v64)', () => {
  it('detects language path prefixes and rewrites or redirects to target route', () => {
    expect(proxySource).toContain("pathname.match(/^\\/([a-z]{2})($|\\/.*)/i)");
    expect(proxySource).toContain('NextResponse.rewrite(rewriteUrl)');
    expect(proxySource).toContain("response.headers.set('x-moneyverse-locale', finalLocale)");
  });

  it('detects explicit query parameters (?lang=... and ?locale=...)', () => {
    expect(proxySource).toContain("request.nextUrl.searchParams.get('lang')");
    expect(proxySource).toContain("request.nextUrl.searchParams.get('locale')");
  });

  it('automatically detects GeoIP country header (cf-ipcountry / x-vercel-ip-country) and sets locale cookie', () => {
    expect(proxySource).toContain("request.headers.get('cf-ipcountry')");
    expect(proxySource).toContain("detectLocale(country, acceptLang)");
    expect(proxySource).toContain("response.cookies.set(LOCALE_COOKIE, finalLocale");
  });

  it('sets high-performance immutable cache headers on static assets', () => {
    expect(proxySource).toContain("Cache-Control', 'public, max-age=31536000, immutable");
  });
});
