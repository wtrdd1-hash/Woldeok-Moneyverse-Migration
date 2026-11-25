import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import config from '../next.config';

/**
 * Next applies an array of rewrites as `afterFiles`: after static routes but
 * BEFORE dynamic ones. A catch-all `/api/:path*` passthrough in that position
 * shadowed every dynamic BFF handler (stock candles, blog slug, auction bid,
 * mint approval, arena rooms), so their validation, symbol lookup and private
 * cache headers never ran and the browser reached Spring directly.
 * The passthrough must sit in `fallback`, after all Next routes.
 */

type Rewrite = { source: string; destination: string };
type Grouped = { beforeFiles?: Rewrite[]; afterFiles?: Rewrite[]; fallback?: Rewrite[] };

async function grouped(): Promise<Grouped> {
  const value = await config.rewrites!();
  return Array.isArray(value) ? { afterFiles: value as Rewrite[] } : (value as Grouped);
}

function dynamicApiRoutes(dir: string, root = dir): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...dynamicApiRoutes(full, root));
    else if (name === 'route.ts' && relative(root, dir).includes('[')) out.push(relative(root, dir));
  }
  return out;
}

describe('API rewrite order', () => {
  it('has dynamic BFF handlers that a catch-all must not shadow', () => {
    expect(dynamicApiRoutes(join(__dirname, 'app/api')).length).toBeGreaterThan(0);
  });

  it('keeps catch-all /api passthroughs out of beforeFiles and afterFiles', async () => {
    const g = await grouped();
    const early = [...(g.beforeFiles ?? []), ...(g.afterFiles ?? [])];
    expect(early.filter((r) => r.source.startsWith('/api/') && r.source.includes(':path*'))).toEqual([]);
  });

  it('still forwards unmatched /api paths after Next routes', async () => {
    const g = await grouped();
    const sources = (g.fallback ?? []).map((r) => r.source);
    expect(sources).toContain('/api/v1/:path*');
    expect(sources).toContain('/api/:path*');
  });
});
