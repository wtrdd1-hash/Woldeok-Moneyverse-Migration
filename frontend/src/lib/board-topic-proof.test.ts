import { describe, expect, it } from 'vitest';
import { parseBoardTopic, verifiedBoardTopicResponse } from './board-topic-proof';

const id = '11111111-2222-4333-8444-555555555555';
const stock = { stockId: id, symbol: 'WDX', name: 'WDX', category: 'analysis', stance: 'none', positionDisclosure: 'undisclosed' };
const row = { postId: id, stock };

describe('verified public board topic scope', () => {
  it('accepts only a single explicit stock/general query', () => {
    expect(parseBoardTopic(undefined)).toEqual({ topic: null, invalid: false });
    expect(parseBoardTopic('stock')).toEqual({ topic: 'stock', invalid: false });
    expect(parseBoardTopic('general')).toEqual({ topic: 'general', invalid: false });
    for (const invalid of ['all', '', ['stock', 'general'], 'STOCK', ' stock ']) {
      expect(parseBoardTopic(invalid).invalid).toBe(true);
    }
  });
  it('requires proof even for empty success and rejects a legacy backend response', () => {
    expect(verifiedBoardTopicResponse({ posts: [], appliedTopic: 'stock' }, 'stock')).toEqual([]);
    expect(verifiedBoardTopicResponse({ posts: [] }, 'stock')).toBeNull();
    expect(verifiedBoardTopicResponse({ posts: [], appliedTopic: 'general' }, 'stock')).toBeNull();
  });
  it('rejects wrong stock classification, duplicates ignoring UUID case and malformed rows', () => {
    expect(verifiedBoardTopicResponse({ posts: [row], appliedTopic: 'stock' }, 'stock')).toEqual([row]);
    expect(verifiedBoardTopicResponse({ posts: [row], appliedTopic: 'general' }, 'general')).toBeNull();
    expect(verifiedBoardTopicResponse({ posts: [row, { ...row, postId: id.toUpperCase() }], appliedTopic: 'stock' }, 'stock')).toBeNull();
    expect(verifiedBoardTopicResponse({ posts: [{ ...row, stock: null }], appliedTopic: 'general' }, 'general')).toEqual([{ ...row, stock: null }]);
    expect(verifiedBoardTopicResponse({ posts: [{ postId: 'bad', stock: null }], appliedTopic: 'general' }, 'general')).toBeNull();
  });
});
