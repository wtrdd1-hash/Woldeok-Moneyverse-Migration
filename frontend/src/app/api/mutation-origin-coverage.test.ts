import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * QA 2026-11-25: 39 BFF write routes had no Origin check while mutate() spends
 * a server-fetched CSRF token, so nothing else stopped a cross-site write.
 * Every POST/PUT/PATCH/DELETE route must check the origin, or be one of the
 * listed server-to-server routes that authenticate by secret or administrator.
 */
const root = join(__dirname);
const SECRET_AUTHENTICATED = new Set([
  'blog/generate/route.ts', 'discord/broadcast/route.ts', 'indexnow/route.ts', 'v1/seo/indexnow/route.ts',
]);

function routes(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? routes(p) : n === 'route.ts' ? [p] : [];
  });
}

describe('BFF write routes', () => {
  const offenders = routes(root)
    .filter((p) => /export (async )?function (POST|PUT|PATCH|DELETE)|export const (POST|PUT|PATCH|DELETE)/.test(readFileSync(p, 'utf8')))
    .map((p) => relative(root, p))
    .filter((r) => !SECRET_AUTHENTICATED.has(r))
    .filter((r) => {
      // Independent review 2026-11-25: matching the word 'origin' let 19
      // hand-rolled checks pass (some fail-open, some refusing every proxied
      // browser). Every write handler must call the shared guard itself.
      const src = readFileSync(join(root, r), 'utf8');
      const handlers = src.match(/export (async )?function (POST|PUT|PATCH|DELETE)\b/g) ?? [];
      const calls = src.match(/isSameOriginFinanceMutation\(/g) ?? [];
      return calls.length < handlers.length;
    });
  it('all check the request origin', () => {
    expect(offenders).toEqual([]);
  });
  it('the secret-authenticated exceptions really authenticate', () => {
    for (const r of SECRET_AUTHENTICATED) {
      expect(readFileSync(join(root, r), 'utf8')).toMatch(/isSchedulerOrAdministrator|authorizedScheduler|CRON_SECRET/);
    }
  });
});
