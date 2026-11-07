import { describe, expect, it } from 'vitest';
import { isVerifiedBoardAuthorOrder } from './board-author-order';

const first = '11111111-2222-4333-8444-555555555555';
const second = '22222222-3333-4444-8555-666666666666';

describe('verified public author ordering', () => {
  it('accepts bounded ordered posts only with explicit backend proof, including verified empty', () => {
    expect(isVerifiedBoardAuthorOrder({ sortApplied: 'author', posts: [] })).toBe(true);
    expect(isVerifiedBoardAuthorOrder({ sortApplied: 'author', posts: [
      { postId: first, authorName: 'Alice' }, { postId: second, authorName: '제주' },
    ] })).toBe(true);
    expect(isVerifiedBoardAuthorOrder({ posts: [] })).toBe(false);
    expect(isVerifiedBoardAuthorOrder({ sortApplied: 'recent', posts: [] })).toBe(false);
  });
  it('rejects forged ordering, UUID-case duplicates, malformed authors and oversized source', () => {
    expect(isVerifiedBoardAuthorOrder({ sortApplied: 'author', posts: [
      { postId: first, authorName: 'Zoe' }, { postId: second, authorName: 'Alice' },
    ] })).toBe(false);
    expect(isVerifiedBoardAuthorOrder({ sortApplied: 'author', posts: [
      { postId: first.toUpperCase(), authorName: 'Alice' }, { postId: first, authorName: 'Alice' },
    ] })).toBe(false);
    expect(isVerifiedBoardAuthorOrder({ sortApplied: 'author', posts: [{ postId: first, authorName: '' }] })).toBe(false);
    expect(isVerifiedBoardAuthorOrder({ sortApplied: 'author', posts: Array(51).fill({ postId: first, authorName: 'Alice' }) })).toBe(false);
  });
});
