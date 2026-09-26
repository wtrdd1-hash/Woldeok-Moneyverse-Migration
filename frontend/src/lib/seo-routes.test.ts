import { describe, expect, it } from 'vitest';
import {
  APP_ROUTES,
  getPublicSitemapRoutes,
  getDisallowedCrawlerRoutes,
  isPathIndexable,
} from '@/config/routes.config';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, detectLocale, parseAcceptLanguage } from './locale';

describe('SEO & i18n SSOT Route Integrity', () => {
  it('enforces English as Primary Default Locale', () => {
    expect(DEFAULT_LOCALE).toBe('en');
    expect(SUPPORTED_LOCALES).toEqual(['ko', 'en', 'ja', 'zh']);
  });

  it('correctly maps hybrid GeoIP and Accept-Language headers', () => {
    // GeoIP checks
    expect(detectLocale('KR', null)).toBe('ko');
    expect(detectLocale('JP', null)).toBe('ja');
    expect(detectLocale('CN', null)).toBe('zh');
    expect(detectLocale('TW', null)).toBe('zh');
    expect(detectLocale('US', null)).toBe('en');
    expect(detectLocale('GB', null)).toBe('en');
    expect(detectLocale('DE', null)).toBe('en');

    // Accept-Language fallback
    expect(parseAcceptLanguage('ko-KR,ko;q=0.9,en-US;q=0.8')).toBe('ko');
    expect(parseAcceptLanguage('ja-JP,ja;q=0.9,en;q=0.8')).toBe('ja');
    expect(parseAcceptLanguage('zh-CN,zh;q=0.9,en;q=0.8')).toBe('zh');
    expect(parseAcceptLanguage('fr-FR,fr;q=0.9')).toBe(null);

    // Global default fallback
    expect(detectLocale(null, null)).toBe('en');
    expect(detectLocale('XX', 'fr-FR')).toBe('en');
  });

  it('ensures all public sitemap routes are strictly public and indexable', () => {
    const sitemapRoutes = getPublicSitemapRoutes();
    expect(sitemapRoutes.length).toBeGreaterThan(0);

    for (const route of sitemapRoutes) {
      expect(route.isPublic, `Route ${route.path} must be public`).toBe(true);
      expect(route.authRequired, `Route ${route.path} must not require auth`).toBe(false);
      expect(route.indexable, `Route ${route.path} must be indexable`).toBe(true);
      expect(route.sitemapPriority).toBeDefined();
    }
  });

  it('strictly excludes member-protected routes from sitemap', () => {
    const sitemapRoutes = getPublicSitemapRoutes();
    const sitemapPaths = sitemapRoutes.map((r) => r.path);

    expect(sitemapPaths).not.toContain('/casino');
    expect(sitemapPaths).not.toContain('/quests');
    expect(sitemapPaths).not.toContain('/businesses');
    expect(sitemapPaths).not.toContain('/stocks/[symbol]');
    expect(sitemapPaths).not.toContain('/bank');
    expect(sitemapPaths).not.toContain('/wallet');
    expect(sitemapPaths).not.toContain('/work');
    expect(sitemapPaths).not.toContain('/seasons');
    expect(sitemapPaths).not.toContain('/spaces');
    expect(sitemapPaths).not.toContain('/admin');
  });

  it('ensures all member-protected and sensitive routes are disallowed in robots.txt', () => {
    const disallowed = getDisallowedCrawlerRoutes();

    expect(disallowed).toContain('/casino');
    expect(disallowed).toContain('/quests');
    expect(disallowed).toContain('/businesses');
    expect(disallowed).toContain('/bank');
    expect(disallowed).toContain('/wallet');
    expect(disallowed).toContain('/work');
    expect(disallowed).toContain('/seasons');
    expect(disallowed).toContain('/admin/');
    expect(disallowed).toContain('/api/');
    expect(disallowed).toContain('/stocks/*');
  });

  it('accurately evaluates path indexability', () => {
    expect(isPathIndexable('')).toBe(true);
    expect(isPathIndexable('/guide')).toBe(true);
    expect(isPathIndexable('/terms')).toBe(true);
    expect(isPathIndexable('/stocks')).toBe(true);
    expect(isPathIndexable('/prediction')).toBe(true);
    expect(isPathIndexable('/casino')).toBe(false);
    expect(isPathIndexable('/bank')).toBe(false);
    expect(isPathIndexable('/work')).toBe(false);
  });
});
