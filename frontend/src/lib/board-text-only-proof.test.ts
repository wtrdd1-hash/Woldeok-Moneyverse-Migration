import { describe, expect, it } from 'vitest';
import { parseBoardMediaFilter, verifiedTextOnlyBoardResponse } from './board-text-only-proof';

const post = {
  postId: 'c38c8a0e-3990-4c20-b3be-7796e734cb30',
  title: 'Hello', authorName: 'Public member', createdAt: '2026-11-02T00:00:00.000Z',
  hasImage: false,
};

describe('public board text-only source proof', () => {
  it('accepts only absent or exact text media parameter', () => {
    expect(parseBoardMediaFilter(undefined)).toEqual({ media: null, invalid: false });
    expect(parseBoardMediaFilter('text')).toEqual({ media: 'text', invalid: false });
    for (const value of ['image', '', 'TEXT', ['text', 'text']]) {
      expect(parseBoardMediaFilter(value).invalid).toBe(true);
    }
  });
  it('accepts a proven empty result, but never invents a verified empty shelf', () => {
    expect(verifiedTextOnlyBoardResponse({ filterApplied: 'text', posts: [] })).toBe(true);
    expect(verifiedTextOnlyBoardResponse({ posts: [] })).toBe(false);
    expect(verifiedTextOnlyBoardResponse({ filterApplied: 'all', posts: [] })).toBe(false);
  });
  it('rejects image rows, duplicate UUIDs and malformed summaries', () => {
    expect(verifiedTextOnlyBoardResponse({ filterApplied: 'text', posts: [post] })).toBe(true);
    expect(verifiedTextOnlyBoardResponse({ filterApplied: 'text', posts: [{ ...post, hasImage: true }] })).toBe(false);
    expect(verifiedTextOnlyBoardResponse({ filterApplied: 'text', posts: [post, { ...post, postId: post.postId.toUpperCase() }] })).toBe(false);
    expect(verifiedTextOnlyBoardResponse({ filterApplied: 'text', posts: [{ ...post, postId: 'bad' }] })).toBe(false);
    expect(verifiedTextOnlyBoardResponse({ filterApplied: 'text', posts: Array(51).fill(post) })).toBe(false);
  });
});
