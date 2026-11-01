import React from 'react';
import { readFileSync } from 'node:fs';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { parseStockCommunityFeed } from './community-feed';
import { TossStyleSocialFeed } from '@/components/stocks/toss-style-social-feed';

const uuid = '9d6c82de-9f02-47a1-8524-7c6ec6d5b77a';
const valid = {
  postId: uuid,
  title: 'A real stock discussion',
  authorName: 'Member',
  createdAt: '2026-10-31T01:02:03.000Z',
  commentCount: 3,
  stock: {
    stockId: uuid,
    symbol: 'WDX',
    name: 'Woldeok Stock',
    category: 'analysis',
    stance: 'bullish',
    positionDisclosure: 'holder',
  },
};

describe('verified stock community source', () => {
  it('distinguishes unavailable, invalid and verified empty responses', () => {
    expect(parseStockCommunityFeed(null).kind).toBe('unavailable');
    expect(parseStockCommunityFeed({ posts: [] })).toEqual({ kind: 'verified', posts: [] });
    expect(parseStockCommunityFeed({ posts: 'wrong' }).kind).toBe('unavailable');
    expect(parseStockCommunityFeed({ posts: [{ ...valid, commentCount: -1 }] }).kind).toBe('unavailable');
    expect(parseStockCommunityFeed({ posts: [{ ...valid, createdAt: 'invalid' }] }).kind).toBe('unavailable');
    expect(parseStockCommunityFeed({ posts: [valid, valid] }).kind).toBe('unavailable');
    expect(parseStockCommunityFeed({ posts: Array.from({ length: 51 }, (_, i) => ({ ...valid, postId: String(i) })) }).kind).toBe('unavailable');
  });

  it('uses only stock-tagged SQL-backed summaries and does not treat holder self-disclosure as verification', () => {
    const result = parseStockCommunityFeed({ posts: [valid, { ...valid, postId: 'non-stock', stock: null }] });
    expect(result.kind).toBe('verified');
    if (result.kind !== 'verified') return;
    expect(result.posts).toHaveLength(1);
    render(<TossStyleSocialFeed posts={result.posts} />);
    expect(screen.getByRole('link', { name: /A real stock discussion/ }).getAttribute('href')).toBe('/board/' + uuid);
    expect(screen.getByText('Member')).toBeDefined();
    expect(screen.queryByText(/주주인증|수익률 인증|112\.8%|가즈아 156/)).toBeNull();
    expect(screen.getByRole('link', { name: /WDX 게시글 작성/ }).getAttribute('href')).toBe('/board?stock=WDX');
  });

  it('rejects forged stock symbols and nonfinite counts rather than rendering them', () => {
    expect(parseStockCommunityFeed({ posts: [{ ...valid, stock: { ...valid.stock, symbol: '../admin' } }] }).kind).toBe('unavailable');
    expect(parseStockCommunityFeed({ posts: [{ ...valid, commentCount: Infinity }] }).kind).toBe('unavailable');
  });

  it('uses server-side public SQL API, no fabricated fallback, and private-data-free SEO', () => {
    const page = readFileSync('src/app/stocks/community/page.tsx', 'utf8');
    expect(page).toContain('/api/v1/board/public/stock-posts');
    expect(page).toContain('parseStockCommunityFeed');
    expect(page).not.toContain('INITIAL_FEED_POSTS');
    expect(page).not.toContain('returnRatePercent');
    expect(page).toContain('robots: { index: false');
  });
});
