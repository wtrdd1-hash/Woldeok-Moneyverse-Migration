// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { metadataForHub, renderBlogHub } from './blog-page-server';

afterEach(() => vi.useRealTimers());

describe('public finance blog hub freshness integration', () => {
  it('renders an accessible, mobile-friendly stale-publication notice and canonical metadata', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-23T00:00:00.000Z'));
    const html = renderToStaticMarkup(renderBlogHub('ko'));
    expect(html).toContain('role="status"');
    expect(html).toContain('마지막 공개 교육 글');
    expect(html).toContain('sm:text-sm');
    expect(html).toContain('aria-current="page"');
    expect(metadataForHub('ko').alternates?.canonical).toBe('https://easy-scraping.com/blog');
  });
});
