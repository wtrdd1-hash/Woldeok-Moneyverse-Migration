// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('league privacy and claims', () => {
  it('protects member-sensitive BFF response and SEO from indexing/caching', () => {
    const bff = readFileSync('src/app/api/stocks/league/route.ts', 'utf8');
    const page = readFileSync('src/app/stocks/league/page.tsx', 'utf8');
    expect(bff).toContain('private, no-store');
    expect(bff).toContain('noindex, nofollow');
    expect(bff).toContain('no-referrer');
    expect(page).toContain('index: false');
    expect(page).not.toContain('184%');
  });
});
