import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALL_SEO_PRESETS } from './seo-presets.config';

/**
 * Live audit 2026-11-25: 8 pages linked /tools/compound-calculator/50m-5y-8p
 * and /monthly-500k-10y (no such preset, 404 — also hit by the Meta crawler),
 * and /tools/compound-interest, /tools/cagr-calculator, /career-guide were 404.
 */
const read = (p: string) => readFileSync(join(__dirname, '..', p), 'utf8');

describe('internal link targets', () => {
  it('every compound preset link in the calculator hub is a real preset', () => {
    const slugs = new Set(ALL_SEO_PRESETS.filter((p) => p.category === 'compound').map((p) => p.slug));
    const links = [...read('components/popular-calculators-hub.tsx').matchAll(/\/tools\/compound-calculator\/([\w-]+)/g)].map((m) => m[1]);
    expect(links.filter((s) => !slugs.has(s!))).toEqual([]);
  });
  it.each([
    ['app/guide/page.tsx', '/tools/compound-interest"'],
    ['components/calculator-retention-funnel.tsx', '"/career-guide"'],
    ['config/pseo-glossary.config.ts', '/tools/cagr-calculator'],
  ])('%s no longer links a missing page', (file, dead) => {
    expect(read(file)).not.toContain(dead);
  });
});
