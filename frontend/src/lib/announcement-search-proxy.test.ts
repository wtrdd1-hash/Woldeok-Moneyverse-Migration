import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '../proxy';

afterEach(() => vi.unstubAllEnvs());

describe('public announcement search HTTP indexing boundary', () => {
  it('sets noindex and no-store for a query-specific page, not the canonical index', () => {
    vi.stubEnv('SEO_INDEXING_ENABLED', 'true');
    vi.stubEnv('TEST_FRONTEND_ORIGIN', '');
    const search = proxy(new NextRequest('https://easy-scraping.com/announcements?q=%EA%B3%B5%EC%A7%80', {
      headers: { host: 'easy-scraping.com' },
    }));
    expect(search.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(search.headers.get('cache-control')).toBe('no-store');
    const canonical = proxy(new NextRequest('https://easy-scraping.com/announcements', {
      headers: { host: 'easy-scraping.com' },
    }));
    expect(canonical.headers.get('x-robots-tag')).toBeNull();
  });
});
