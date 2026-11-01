import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { publicApi } from '@/lib/api';
import GalleryPage, { generateMetadata } from './page';

vi.mock('@/lib/api', () => ({ publicApi: vi.fn() }));
vi.mock('@/components/translated-text', () => ({ TranslatedText: ({ korean }: { korean: string }) => korean }));

beforeEach(() => { vi.mocked(publicApi).mockReset().mockResolvedValue({ photos: [] }); });

describe('public gallery publication-day search UX', () => {
  it('renders a labelled GET date search and discloses the bounded source', async () => {
    const html = renderToStaticMarkup(await GalleryPage({ searchParams: Promise.resolve({ day: '2026-09-07' }) }));
    expect(html).toContain('type="date"');
    expect(html).toContain('name="day"');
    expect(html).toContain('2026-09-07');
    expect(html).toContain('24');
    expect(publicApi).toHaveBeenCalledWith('/api/v1/photos?day=2026-09-07', 0);
    expect((await generateMetadata({ searchParams: Promise.resolve({ day: '2026-09-07' }) })).robots).toEqual({ index: false, follow: false });
  });
  it('does not present a stale unfiltered success response as an empty gallery day', async () => {
    vi.mocked(publicApi).mockResolvedValue({ photos: [{
      photoId: '2e090c86-3cd8-47ca-b7db-4be7d7b8daad',
      imageUrl: '/media/7eede72c-432b-4a45-8ba6-420dd24350c7.jpg',
      altText: 'Other day', publishedAt: '2026-09-05T15:00:00.000Z',
    }] });
    const html = renderToStaticMarkup(await GalleryPage({ searchParams: Promise.resolve({ day: '2026-09-07' }) }));
    expect(html).toContain('지금은 사진을 불러올 수 없어요');
    expect(html).not.toContain('선택한 날짜에 해당하는 최근 사진이 없어요');
  });
  it('does not fetch when an invalid day is supplied', async () => {
    const html = renderToStaticMarkup(await GalleryPage({ searchParams: Promise.resolve({ day: '2026-02-30' }) }));
    expect(html).toContain('올바른 날짜');
    expect(publicApi).not.toHaveBeenCalled();
  });
});
