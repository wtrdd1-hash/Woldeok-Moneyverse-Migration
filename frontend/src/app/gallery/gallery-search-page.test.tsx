import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import GalleryPage, { generateMetadata } from './page';
import { publicApi } from '@/lib/api';

vi.mock('@/lib/api', () => ({ publicApi: vi.fn() }));

const photo = { photoId: '2e090c86-3cd8-47ca-b7db-4be7d7b8daad', imageUrl: '/media/photo.jpg', altText: '제주 돌담', publishedAt: '2026-10-31T10:00:00.000Z' };

describe('public gallery search page', () => {
  it('uses verified latest-24 results, visible scope and noindex metadata', async () => {
    vi.mocked(publicApi).mockResolvedValue({ photos: [photo], searchScope: 'latest_24', searchApplied: true });
    const searchParams = Promise.resolve({ q: '제주' });
    const html = renderToStaticMarkup(await GalleryPage({ searchParams }));
    expect(html).toContain('최근 공개 사진 최대 24장');
    expect(html).toContain('제주 돌담');
    expect(vi.mocked(publicApi)).toHaveBeenCalledWith('/api/v1/photos?q=%EC%A0%9C%EC%A3%BC', 0);
    expect((await generateMetadata({ searchParams })).robots).toEqual({ index: false, follow: false });
  });

  it('does not fetch or render gallery data for malformed search terms', async () => {
    vi.mocked(publicApi).mockClear();
    const html = renderToStaticMarkup(await GalleryPage({ searchParams: Promise.resolve({ q: ['제주', '호주'] }) }));
    expect(html).toContain('검색어는 2~40자');
    expect(vi.mocked(publicApi)).not.toHaveBeenCalled();
  });
});
