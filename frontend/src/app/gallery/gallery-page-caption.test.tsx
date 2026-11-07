import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { publicApi } from '@/lib/api';
import GalleryPage, { generateMetadata } from './page';
vi.mock('@/lib/api', () => ({ publicApi: vi.fn() }));

describe('gallery caption search page SEO and accessibility', () => {
  it('keeps the canonical gallery indexable but prevents filtered results indexing', async () => {
    const normal = await generateMetadata({ searchParams: Promise.resolve({}) });
    const filtered = await generateMetadata({ searchParams: Promise.resolve({ q: '제주' }) });
    expect(normal.robots).toBeUndefined();
    expect(filtered.robots).toEqual({ index: false, follow: false });
  });
  it('renders a labelled keyboard-accessible form and never presents an unfiltered legacy response as matching', async () => {
    vi.mocked(publicApi).mockResolvedValue({
      photos: [{ photoId: 'p1', altText: '부산', imageUrl: '/media/a.jpg', publishedAt: null }],
    });
    const html = renderToStaticMarkup(await GalleryPage({ searchParams: Promise.resolve({ q: '제주' }) }));
    expect(html).toContain('role="search"');
    expect(html).toContain('name="q"');
    expect(html).toContain('minLength="2"');
    expect(html).toContain('gallery-caption-scope');
    expect(html).not.toContain('href="/gallery/p1"');
    expect(publicApi).toHaveBeenCalledWith('/api/v1/photos?q=%EC%A0%9C%EC%A3%BC', 0);
  });
});
