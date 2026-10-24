import { afterEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '../../../proxy';

const originalIndexing = process.env.SEO_INDEXING_ENABLED;

afterEach(() => {
  if (originalIndexing === undefined) delete process.env.SEO_INDEXING_ENABLED;
  else process.env.SEO_INDEXING_ENABLED = originalIndexing;
});

describe('Private prestige response policy', () => {
  it.each(['/progression/prestige', '/en/progression/prestige'])(
    'does not index or cache the authenticated route %s',
    (pathname) => {
      process.env.SEO_INDEXING_ENABLED = 'true';
      const response = proxy(new NextRequest('https://easy-scraping.com' + pathname));
      expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
      expect(response.headers.get('cache-control')).toBe('private, no-store');
    },
  );

  it('does not apply private cache headers to a public guide', () => {
    process.env.SEO_INDEXING_ENABLED = 'true';
    const response = proxy(new NextRequest('https://easy-scraping.com/guide'));
    expect(response.headers.get('cache-control')).not.toBe('private, no-store');
  });
});
