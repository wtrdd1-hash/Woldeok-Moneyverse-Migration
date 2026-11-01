import { describe, expect, it } from 'vitest';
import { isVerifiedBoardReplyThreshold } from './board-reply-proof';
const id = '123e4567-e89b-42d3-a456-426614174000';
describe('verified public reply threshold', () => {
  it('accepts only a matching bounded filtered snapshot', () => {
    expect(isVerifiedBoardReplyThreshold({ minReplies: 5, posts: [{ postId: id, commentCount: 5 }] }, 5)).toBe(true);
    expect(isVerifiedBoardReplyThreshold({ minReplies: 5, posts: [] }, 5)).toBe(true);
  });
  it.each([
    { posts: [] },
    { minReplies: 2, posts: [] },
    { minReplies: 5, posts: [{ postId: id, commentCount: 4 }] },
    { minReplies: 5, posts: [{ postId: id, commentCount: '5' }] },
    { minReplies: 5, posts: [{ postId: id, commentCount: 5 }, { postId: id.toUpperCase(), commentCount: 6 }] },
    { minReplies: 5, posts: Array.from({ length: 51 }, (_, n) => ({ postId: `${n}`, commentCount: 5 })) },
  ])('rejects unverified source response %j', (payload) => {
    expect(isVerifiedBoardReplyThreshold(payload, 5)).toBe(false);
  });
});
