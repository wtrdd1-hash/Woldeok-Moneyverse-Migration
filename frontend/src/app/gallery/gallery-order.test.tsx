import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const publicApi = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api', () => ({ publicApi }));
import GalleryPage, { generateMetadata } from './page';
import { parseGallerySort } from './gallery-sort';

describe('recent approved gallery sorting', () => {
  it('accepts only one explicit sort value', () => {
    expect(parseGallerySort(undefined)).toEqual({ sort: 'newest', invalid: false, filtered: false });
    expect(parseGallerySort('oldest')).toEqual({ sort: 'oldest', invalid: false, filtered: true });
    for (const value of ['', 'OLD', ['oldest', 'newest'], 'oldest%0a']) {
      expect(parseGallerySort(value).invalid).toBe(true);
    }
  });

  it('renders an accessible GET control with a truthful latest-24 scope and queries the backend', async () => {
    publicApi.mockResolvedValue({ photos: [] });
    const markup = renderToStaticMarkup(await GalleryPage({ searchParams: Promise.resolve({ sort: 'oldest' }) }));
    expect(markup).toContain('name="sort"');
    expect(markup).toContain('method="get"');
    expect(markup).toContain('최근 승인');
    expect(markup).toContain('24장');
    expect(publicApi).toHaveBeenCalledWith('/api/v1/photos?sort=oldest', 0);
    expect((await generateMetadata({ searchParams: Promise.resolve({ sort: 'oldest' }) })).robots).toMatchObject({ index: false });
  });

  it('refuses duplicate sort without contacting the backend or claiming an empty gallery', async () => {
    publicApi.mockClear();
    const markup = renderToStaticMarkup(await GalleryPage({ searchParams: Promise.resolve({ sort: ['oldest', 'newest'] }) }));
    expect(publicApi).not.toHaveBeenCalled();
    expect(markup).toContain('정렬 조건');
  });
});
