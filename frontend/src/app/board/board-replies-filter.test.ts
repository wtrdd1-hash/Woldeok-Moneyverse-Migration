import { describe, expect, it } from 'vitest';
import { parseBoardRepliedFilter, isVerifiedRepliedPosts } from './board-replies-filter';

describe('public board replied-only filter', () => {
  it('accepts an omitted filter or the exact opt-in value', () => {
    expect(parseBoardRepliedFilter(undefined)).toEqual({ enabled: false, invalid: false });
    expect(parseBoardRepliedFilter('1')).toEqual({ enabled: true, invalid: false });
  });
  it.each(['', '0', 'true', ' 1 ', ['1', '1'], ['1'], 1, null])(
    'rejects malformed or duplicate filter %j', (value) => {
      expect(parseBoardRepliedFilter(value).invalid).toBe(true);
    },
  );
  it('requires an explicit applied-scope marker and positive counts even on empty results', () => {
    const valid = { appliedFilters: { repliedOnly: true, scope: 'latest50' }, posts: [
      { postId: '11111111-2222-4333-8444-555555555555', commentCount: 2 },
    ] };
    expect(isVerifiedRepliedPosts(valid)).toBe(true);
    expect(isVerifiedRepliedPosts({ posts: [] })).toBe(false);
    expect(isVerifiedRepliedPosts({ ...valid, posts: [] })).toBe(true);
    expect(isVerifiedRepliedPosts({ ...valid, posts: [{ ...valid.posts[0], commentCount: 0 }] })).toBe(false);
    expect(isVerifiedRepliedPosts({ ...valid, posts: [{ ...valid.posts[0], commentCount: '2' }] })).toBe(false);
    expect(isVerifiedRepliedPosts({ ...valid, posts: [{ ...valid.posts[0], commentCount: 1.5 }] })).toBe(false);
    expect(isVerifiedRepliedPosts({ ...valid, posts: Array(51).fill(valid.posts[0]) })).toBe(false);
    expect(isVerifiedRepliedPosts({ ...valid, posts: [valid.posts[0], valid.posts[0]] })).toBe(false);
  });
});
