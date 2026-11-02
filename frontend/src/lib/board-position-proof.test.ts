import { describe, expect, it } from 'vitest';
import { isVerifiedBoardPositionResponse } from './board-position-proof';

const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
describe('board position source proof', () => {
  it('requires the source echo even for zero posts', () => {
    expect(isVerifiedBoardPositionResponse({ posts: [], appliedPosition: 'holder' }, 'holder')).toBe(true);
    expect(isVerifiedBoardPositionResponse({ posts: [] }, 'holder')).toBe(false);
  });
  it('requires valid unique UUIDs and matching self-declarations', () => {
    const post = { postId: id, stock: { positionDisclosure: 'holder' } };
    expect(isVerifiedBoardPositionResponse({ posts: [post], appliedPosition: 'holder' }, 'holder')).toBe(true);
    expect(isVerifiedBoardPositionResponse({ posts: [post, post], appliedPosition: 'holder' }, 'holder')).toBe(false);
    expect(isVerifiedBoardPositionResponse({ posts: [{ ...post, stock: null }], appliedPosition: 'holder' }, 'holder')).toBe(false);
  });
});
