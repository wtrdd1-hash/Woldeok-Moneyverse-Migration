import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('@/lib/api', () => ({ publicApi: vi.fn() }));
vi.mock('@/lib/viewer', () => ({
  currentViewer: vi.fn(async () => ({ signedIn: false, consentCurrent: false, adminRoles: [] })),
}));

import { publicApi } from '@/lib/api';
import SearchPage, { metadata } from './page';

const id = '123e4567-e89b-42d3-a456-426614174000';

async function html(q: string | string[] | undefined) {
  return renderToStaticMarkup(await SearchPage({ searchParams: Promise.resolve({ q }) }));
}

beforeEach(() => {
  vi.mocked(publicApi).mockReset();
});

describe('server-integrated global search', () => {
  it('uses the actual public board API and exposes a safe post link', async () => {
    vi.mocked(publicApi).mockResolvedValue({ posts: [{ postId: id, title: '투자 이야기', authorName: '회원' }] });
    const rendered = await html('투자');
    expect(publicApi).toHaveBeenCalledWith('/api/v1/board/public/stock-posts', 60);
    expect(rendered).toContain(`href="/board/${id}"`);
    expect(rendered).toContain('투자 이야기');
    expect(rendered).toContain('최대 50개');
    expect(rendered).toContain('role="status"');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('shows a distinct outage state instead of falsely claiming no results', async () => {
    vi.mocked(publicApi).mockResolvedValue(null);
    const rendered = await html('투자');
    expect(rendered).toContain('최근 게시글을 불러오지 못했습니다.');
    expect(rendered).not.toContain('검색 결과가 없습니다.');
  });

  it('does not call the board API for blank or repeated query parameters', async () => {
    await html('');
    await html(['투자', 'admin']);
    expect(publicApi).not.toHaveBeenCalled();
  });
});
