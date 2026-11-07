import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { publicApi } = vi.hoisted(() => ({ publicApi: vi.fn() }));
vi.mock('@/lib/api', () => ({ publicApi }));
vi.mock('./board-participation', () => ({ BoardParticipation: () => <div data-testid="participation" /> }));
vi.mock('@/components/public-advertisement', () => ({ PublicAdvertisement: () => <div /> }));

import BoardPage, { generateMetadata } from './page';

const id = '11111111-2222-4333-8444-555555555555';
const post = {
  postId: id, title: 'Board', authorName: 'Alice', createdAt: '2026-11-01T00:00:00Z',
  updatedAt: null, commentCount: 0, mine: false, stock: null,
};

beforeEach(() => { vi.clearAllMocks(); });

describe('public board author sort SSR', () => {
  it('preserves stock and title filters, verifies backend proof, and noindexes sorted pages', async () => {
    publicApi.mockResolvedValue({ posts: [post], sortApplied: 'author' });
    const params = { stock: 'WDX', q: 'Board', sort: 'author' };
    const html = renderToStaticMarkup(await BoardPage({ searchParams: Promise.resolve(params) }));
    expect(publicApi).toHaveBeenCalledWith('/api/v1/board/public/stock-posts?stock=WDX&q=Board&sort=author', 0);
    expect(html).toContain('작성자 이름순');
    expect(html).toContain('Alice');
    expect((await generateMetadata({ searchParams: Promise.resolve(params) })).robots).toEqual({ index: false, follow: true });
  });

  it('does not render unverified success-shaped posts as verified results', async () => {
    publicApi.mockResolvedValue({ posts: [post] });
    const html = renderToStaticMarkup(await BoardPage({ searchParams: Promise.resolve({ sort: 'author' }) }));
    expect(html).toContain('게시글을 불러오지 못했어요.');
    expect(html).not.toContain('>Alice<');
  });

  it('rejects ambiguous sort before any upstream fetch', async () => {
    const html = renderToStaticMarkup(await BoardPage({ searchParams: Promise.resolve({ sort: ['author', 'author'] as unknown as string }) }));
    expect(publicApi).not.toHaveBeenCalled();
    expect(html).toContain('지원하지 않는 게시글 정렬입니다.');
  });
});
