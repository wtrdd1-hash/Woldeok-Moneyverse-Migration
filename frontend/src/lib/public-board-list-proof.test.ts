import { describe, expect, it } from 'vitest';
import { isVerifiedPublicBoardList } from './public-board-list-proof';

const valid = {
  postId: '11111111-1111-4111-8111-111111111111', title: 'A post', authorName: 'Member',
  createdAt: '2026-11-02T12:00:00.000Z', updatedAt: null,
  commentCount: 0, mine: false, hasImage: false, stock: null,
};

describe('public board identity proof for SSR and Android', () => {
  it('accepts a verified empty latest-50 response and a valid post', () => {
    expect(isVerifiedPublicBoardList({ posts: [] })).toBe(true);
    expect(isVerifiedPublicBoardList({ posts: [valid] })).toBe(true);
  });
  it.each([
    null, {}, { posts: null }, { posts: Array(51).fill(valid) },
    { posts: [{ ...valid, postId: 'oops' }] },
    { posts: [valid, { ...valid, postId: valid.postId.toUpperCase() }] },
    { posts: [{ ...valid, mine: true }] },
    { posts: [{ ...valid, commentCount: Number.MAX_SAFE_INTEGER + 1 }] },
    { posts: [{ ...valid, createdAt: 'not-a-date' }] },
    { posts: [{ ...valid, title: '' }] },
  ])('rejects unverified successful data %j', (payload) => {
    expect(isVerifiedPublicBoardList(payload)).toBe(false);
  });
});
