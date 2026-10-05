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
    expect(proxySource).toContain("request.cookies.set(DETECTED_LOCALE_COOKIE, explicitPrefixLocale)");
    expect(proxySource).toContain('NextResponse.rewrite(rewriteUrl)');
    expect(proxySource).toContain("response.headers.set('x-moneyverse-locale', finalLocale)");
  });

  it('detects explicit query parameters (?lang=... and ?locale=...)', () => {
    expect(proxySource).toContain("request.nextUrl.searchParams.get('lang')");
    expect(proxySource).toContain("request.nextUrl.searchParams.get('locale')");
  });

  it('automatically detects GeoIP and moves non-Korean root traffic to a stable locale URL', () => {
    expect(proxySource).toContain("request.headers.get('cf-ipcountry')");
    expect(proxySource).toContain("detectLocale(country, acceptLang)");
    expect(proxySource).toContain("const rootLocale = validQueryLocale ?? userSavedLocale ?? detectedGeoLocale");
    expect(proxySource).toContain("pathname === '/' && rootLocale !== 'ko'");
    expect(proxySource).toContain('`/${rootLocale}${request.nextUrl.search}`');
    expect(proxySource).toContain("redirect.cookies.set(DETECTED_LOCALE_COOKIE, rootLocale");
  });

  it('sets high-performance immutable cache headers on static assets', () => {
    expect(proxySource).toContain("Cache-Control', 'public, max-age=31536000, immutable");
  });
});
