import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { APP_ROUTES, getDisallowedCrawlerRoutes, getPublicSitemapRoutes } from '@/config/routes.config';

const source = (route: string) => readFileSync(join(process.cwd(), 'src/app', route, 'page.tsx'), 'utf8');

/** A private member route must not contradict its robots/sitemap classification in page metadata. */
describe('member gameplay indexing privacy', () => {
  for (const route of ['quests', 'businesses']) {
    it(`marks /${route} noindex/nofollow without weakening the existing member/API boundary`, () => {
      const page = source(route);
      const routeConfig = APP_ROUTES.find((item) => item.path === `/${route}`);
      expect(routeConfig).toMatchObject({ isPublic: false, authRequired: true, indexable: false });
      expect(page).toMatch(/robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/);
      expect(page).toContain('await requireMember();');
      expect(page.indexOf('await requireMember();')).toBeLessThan(page.indexOf('apiOrNull<'));
      expect(page).toContain('export const dynamic = \'force-dynamic\';');
      expect(getDisallowedCrawlerRoutes()).toContain(`/${route}`);
      expect(getPublicSitemapRoutes().map((item) => item.path)).not.toContain(`/${route}`);
    });
  }
});
