import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { publicApi } = vi.hoisted(() => ({ publicApi: vi.fn() }));
vi.mock('@/lib/api', () => ({ publicApi }));
import StockCommunityFeedPage, { metadata } from './page';

describe('stock community server/API integration', () => {
  beforeEach(() => { publicApi.mockReset(); });

  it('uses the PostgreSQL-backed public board endpoint with a bounded stock filter', async () => {
    publicApi.mockResolvedValue({ posts: [] });
    render(await StockCommunityFeedPage({ searchParams: Promise.resolve({ stock: 'wdx' }) }));
    expect(publicApi).toHaveBeenCalledWith('/api/v1/board/public/stock-posts?stock=WDX', 0);
    expect(screen.getByRole('link', { name: /토론 글 작성/ }).getAttribute('href')).toBe('/board?stock=WDX');
  });

  it('does not forward invalid user-supplied stock symbols to the API', async () => {
    publicApi.mockResolvedValue({ posts: [] });
    render(await StockCommunityFeedPage({ searchParams: Promise.resolve({ stock: '../../private?x=1' }) }));
    expect(publicApi).toHaveBeenCalledWith('/api/v1/board/public/stock-posts', 0);
  });

  it('fails closed on API failure and does not index duplicate member discussion pages', async () => {
    publicApi.mockResolvedValue(null);
    render(await StockCommunityFeedPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole('alert').textContent).toContain('불러오지 못했어요');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
