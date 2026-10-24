import { describe, expect, it } from 'vitest';
import { filterRecentPublicBoardPosts, normalizeSearchQuery } from './recent-board';

const firstId = '123e4567-e89b-42d3-a456-426614174000';
const secondId = '123e4567-e89b-42d3-a456-426614174001';
const posts = {
  posts: [
    { postId: firstId, title: '주식 투자 토론', authorName: 'Member A' },
    { postId: secondId, title: '채권 공부 기록', authorName: 'Member B' },
  ],
};

describe('recent public board title search', () => {
  it('matches public post titles only and returns canonical UUID links', () => {
    expect(filterRecentPublicBoardPosts(posts, ' 투자 ')).toEqual([
      { postId: firstId, title: '주식 투자 토론', authorName: 'Member A' },
    ]);
    expect(filterRecentPublicBoardPosts(posts, 'Member A')).toEqual([]);
  });

  it('never turns a failed or malformed API response into a confirmed empty result', () => {
    expect(filterRecentPublicBoardPosts(null, '투자')).toBeNull();
    expect(filterRecentPublicBoardPosts({ posts: 'unavailable' }, '투자')).toBeNull();
    expect(filterRecentPublicBoardPosts({ posts: [{ postId: firstId, title: 5 }] }, '투자')).toBeNull();
  });

  it('excludes unsafe identifiers and bounds visible results', () => {
    const repeated = Array.from({ length: 20 }, (_, index) => ({
      postId: `123e4567-e89b-42d3-a456-${(426614174000 + index).toString()}`,
      title: '공개 게시글',
      authorName: 'Member',
    }));
    expect(filterRecentPublicBoardPosts({ posts: [{ postId: '../admin', title: '공개 게시글', authorName: 'Member' }, ...repeated] }, '공개', 5)?.length).toBe(5);
    expect(filterRecentPublicBoardPosts({ posts: repeated }, '공개', 100)?.length).toBe(10);
  });

  it('normalizes only a scalar query and caps user input to 80 characters', () => {
    expect(normalizeSearchQuery(['투자', 'admin'])).toBe('');
    expect(normalizeSearchQuery({ q: '투자' })).toBe('');
    expect(normalizeSearchQuery('  투자  ')).toBe('투자');
    expect(normalizeSearchQuery('a'.repeat(200)).length).toBe(80);
  });

  it('never searches the full board from a blank query', () => {
    expect(filterRecentPublicBoardPosts(posts, '   ')).toEqual([]);
  });
});
