import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { getPublicSitemapRoutes } from '@/config/routes.config';
import sitemap from '@/app/sitemap';

describe('SEO Sitemap & Indexing Integrity Guardrails', () => {
  it('P0: getPublicSitemapRoutes() must never include noindex / internal game routes (/arcade, /work, /seasons)', () => {
    const publicRoutes = getPublicSitemapRoutes();
    const publicPaths = publicRoutes.map((r) => r.path);

    // Explicitly forbidden routes that have noindex in page.tsx
    const forbiddenNoindexRoutes = ['/arcade', '/work', '/seasons', '/casino'];

    for (const forbidden of forbiddenNoindexRoutes) {
      expect(publicPaths).not.toContain(forbidden);
    }
  });

  it('P0: all routes returned by getPublicSitemapRoutes() must have indexable === true', () => {
    const publicRoutes = getPublicSitemapRoutes();
    for (const route of publicRoutes) {
      expect(route.indexable).toBe(true);
    }
  });

  it('P1: sitemap() generated URLs must exclude /arcade, /work, /seasons', () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);

    expect(urls.some((u) => u.endsWith('/arcade'))).toBe(false);
    expect(urls.some((u) => u.endsWith('/work'))).toBe(false);
    expect(urls.some((u) => u.endsWith('/seasons'))).toBe(false);
    expect(urls.some((u) => u.endsWith('/casino'))).toBe(false);
  });

  it('P1: sitemap() entries must have fresh lastModified date (>= 2026-10-24), not stale 2026-10-13', () => {
    const entries = sitemap();
    expect(entries.length).toBeGreaterThan(50);

    const minAllowedTimestamp = new Date('2026-10-24T00:00:00.000Z').getTime();

    for (const entry of entries) {
      const lastModDate = entry.lastModified ? new Date(entry.lastModified).getTime() : 0;
      expect(lastModDate).toBeGreaterThanOrEqual(minAllowedTimestamp);
    }
  });

  it('P1: 4-locale home H1 semantic markup and metadata coverage integrity', () => {
    const pageSourcePath = path.resolve(__dirname, '../app/page.tsx');
    const pageSource = fs.readFileSync(pageSourcePath, 'utf8');

    // 1. Must define H1 for all 4 supported locales
    expect(pageSource).toContain('HOME_H1_BY_LOCALE');
    expect(pageSource).toContain("ko: '월덕 머니버스");
    expect(pageSource).toContain("en: 'Woldeok Moneyverse");
    expect(pageSource).toContain("ja: 'ウォルドク・マネーバース");
    expect(pageSource).toContain("zh: '月德 Moneyverse");

    // 2. Must render semantic H1 tag
    expect(pageSource).toContain('<h1 className="sr-only">');
    expect(pageSource).toContain('{HOME_H1_BY_LOCALE[locale] ?? HOME_H1_BY_LOCALE.en}');
  });
});
