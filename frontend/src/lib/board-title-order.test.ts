import { describe, expect, it } from 'vitest';
import { isVerifiedBoardTitleOrder } from './board-title-order';

const first = '11111111-2222-4333-8444-555555555555';
const second = '22222222-3333-4444-8555-666666666666';

describe('verified public title ordering', () => {
  it('accepts bounded ordered posts only with explicit backend proof, including verified empty', () => {
    expect(isVerifiedBoardTitleOrder({ sortApplied: 'title', posts: [] })).toBe(true);
    expect(isVerifiedBoardTitleOrder({ sortApplied: 'title', posts: [
      { postId: first, title: 'Alice' }, { postId: second, title: '제주' },
    ] })).toBe(true);
    expect(isVerifiedBoardTitleOrder({ posts: [] })).toBe(false);
    expect(isVerifiedBoardTitleOrder({ sortApplied: 'recent', posts: [] })).toBe(false);
  });
  it('rejects forged ordering, UUID-case duplicates, malformed titles and oversized source', () => {
    expect(isVerifiedBoardTitleOrder({ sortApplied: 'title', posts: [
      { postId: first, title: 'Zoe' }, { postId: second, title: 'Alice' },
    ] })).toBe(false);
    expect(isVerifiedBoardTitleOrder({ sortApplied: 'title', posts: [
      { postId: first.toUpperCase(), title: 'Alice' }, { postId: first, title: 'Alice' },
    ] })).toBe(false);
    expect(isVerifiedBoardTitleOrder({ sortApplied: 'title', posts: [
      { postId: second, title: 'Same' }, { postId: first, title: 'Same' },
    ] })).toBe(false);
    expect(isVerifiedBoardTitleOrder({ sortApplied: 'title', posts: [
      { postId: first, title: 'Same' }, { postId: second, title: 'Same' },
    ] })).toBe(true);
    expect(isVerifiedBoardTitleOrder({ sortApplied: 'title', posts: [{ postId: first, title: '' }] })).toBe(false);
    expect(isVerifiedBoardTitleOrder({ sortApplied: 'title', posts: Array(51).fill({ postId: first, title: 'Alice' }) })).toBe(false);
  });
});
