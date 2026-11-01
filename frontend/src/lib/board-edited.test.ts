import { describe, expect, it } from 'vitest';
import { isVerifiedEditedBoardPosts } from './board-edited';

const POST = {
  postId: '11111111-2222-4333-8444-555555555555',
  title: 'WLD Tips', authorName: 'User',
  createdAt: '2026-10-30T01:00:00.000Z',
  updatedAt: '2026-10-31T01:00:00.000Z',
  commentCount: 0, mine: false, hasImage: false,
  stock: { symbol: 'WDX' },
};

describe('bounded edited-post source proof', () => {
  it('accepts a verified empty set and a matching edited post', () => {
    expect(isVerifiedEditedBoardPosts({ posts: [] })).toBe(true);
    expect(isVerifiedEditedBoardPosts({ posts: [POST] }, 'wdx', 'wld')).toBe(true);
  });
  it('rejects duplicate IDs irrespective of UUID letter case', () => {
    const post = { ...POST, postId: 'abcdefab-2222-4333-8444-555555555555' };
    expect(isVerifiedEditedBoardPosts({ posts: [post, { ...post, postId: post.postId.toUpperCase() }] })).toBe(false);
  });
  it('rejects unedited, invalid, foreign-stock and nonmatching-title success shapes', () => {
    expect(isVerifiedEditedBoardPosts({ posts: [{ ...POST, updatedAt: POST.createdAt }] })).toBe(false);
    expect(isVerifiedEditedBoardPosts({ posts: [{ ...POST, updatedAt: null }] })).toBe(false);
    expect(isVerifiedEditedBoardPosts({ posts: [{ ...POST, mine: true }] })).toBe(false);
    expect(isVerifiedEditedBoardPosts({ posts: [POST] }, 'AAA')).toBe(false);
    expect(isVerifiedEditedBoardPosts({ posts: [POST] }, null, 'other')).toBe(false);
    expect(isVerifiedEditedBoardPosts({ posts: Array(51).fill(POST) })).toBe(false);
    expect(isVerifiedEditedBoardPosts({ posts: 'not-array' })).toBe(false);
  });
});
