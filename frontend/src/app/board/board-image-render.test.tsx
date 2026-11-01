import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { publicApi } from '@/lib/api';
import BoardPage, { generateMetadata } from './page';

vi.mock('@/lib/api', () => ({ publicApi: vi.fn() }));
vi.mock('./board-participation', () => ({ BoardParticipation: () => null }));
vi.mock('@/components/public-advertisement', () => ({ PublicAdvertisement: () => null }));

beforeEach(() => { vi.mocked(publicApi).mockReset(); });

describe('board image-only SSR and SEO', () => {
  it('renders a checked, labelled GET filter, bounded empty state and nonindex metadata', async () => {
    vi.mocked(publicApi).mockResolvedValue({ posts: [] });
    const params = { withImage: '1', q: 'photo' };
    const metadata = await generateMetadata({ searchParams: Promise.resolve(params) });
    expect(metadata.robots).toEqual({ index: false, follow: true });
    const html = renderToStaticMarkup(await BoardPage({ searchParams: Promise.resolve(params) }));
    expect(html).toContain('name="withImage"');
    expect(html).toContain('checked=""');
    expect(html).toContain('사진 첨부 글만 보기');
    expect(html).toContain('최근 공개 게시글 50건');
    expect(vi.mocked(publicApi)).toHaveBeenCalledWith(
      '/api/v1/board/public/stock-posts?q=photo&withImage=1', 0,
    );
  });
  it('rejects duplicate image filters without making a public API request', async () => {
    const html = renderToStaticMarkup(await BoardPage({
      searchParams: Promise.resolve({ withImage: ['1', '1'] }),
    }));
    expect(html).toContain('사진 필터 값이 올바르지 않습니다');
    expect(vi.mocked(publicApi)).not.toHaveBeenCalled();
  });
});
