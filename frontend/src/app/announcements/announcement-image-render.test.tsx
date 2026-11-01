import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { publicApi } from '@/lib/api';
import AnnouncementsPage, { generateMetadata } from './page';

vi.mock('@/lib/api', () => ({ publicApi: vi.fn() }));
vi.mock('@/components/public-advertisement', () => ({ PublicAdvertisement: () => null }));

beforeEach(() => vi.mocked(publicApi).mockReset());

describe('announcement image-only SSR and SEO', () => {
  it('renders the labelled image filter and verified empty result without indexing', async () => {
    vi.mocked(publicApi).mockResolvedValue({ announcements: [], filterApplied: 'with-image', sourceLimit: 20 });
    const params = { withImage: '1' };
    expect((await generateMetadata({ searchParams: Promise.resolve(params) })).robots).toEqual({ index: false, follow: true });
    const html = renderToStaticMarkup(await AnnouncementsPage({ searchParams: Promise.resolve(params) }));
    expect(html).toContain('name="withImage"');
    expect(html).toContain('checked=""');
    expect(html).toContain('최근 공개 공지 20건');
    expect(html).toContain('사진이 첨부된 공지가 없어요');
    expect(publicApi).toHaveBeenCalledWith('/api/v1/announcements?withImage=1', 0);
  });
  it('does not show unfiltered results from a backend that ignored the filter', async () => {
    vi.mocked(publicApi).mockResolvedValue({ announcements: [{ announcementId: 'x', title: 'Unfiltered', imageUrl: null }] });
    const html = renderToStaticMarkup(await AnnouncementsPage({ searchParams: Promise.resolve({ withImage: '1' }) }));
    expect(html).not.toContain('Unfiltered');
    expect(html).toContain('지금은 공지를 불러올 수 없어요');
  });
  it('rejects duplicate filter parameters before calling the backend', async () => {
    const html = renderToStaticMarkup(await AnnouncementsPage({ searchParams: Promise.resolve({ withImage: ['1', '1'] }) }));
    expect(html).toContain('사진 필터 값이 올바르지 않습니다');
    expect(publicApi).not.toHaveBeenCalled();
  });
});
