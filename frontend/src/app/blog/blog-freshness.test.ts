import { describe, expect, it } from 'vitest';
import { getBlogFreshnessNotice } from './blog-freshness';

const articles = [
  { publishedAt: '2026-10-14T14:00:00.000Z' },
  { publishedAt: '2026-10-15T14:00:00.000Z' },
];

describe('Blog publication freshness v969', () => {
  it('communicates last approved publication, not false real-time updates', () => {
    expect(getBlogFreshnessNotice(articles, 'ko', new Date('2026-10-20T00:00:00Z'))).toContain('2026-10-15');
    expect(getBlogFreshnessNotice(articles, 'ko', new Date('2026-10-20T00:00:00Z'))).toContain('검증');
    expect(getBlogFreshnessNotice(articles, 'en', new Date('2026-10-20T00:00:00Z'))).toContain('2026-10-15');
  });
  it('does not warn if a recent approved post exists or posts are empty', () => {
    expect(getBlogFreshnessNotice(articles, 'ko', new Date('2026-10-16T00:00:00Z'))).toBeNull();
    expect(getBlogFreshnessNotice([], 'ko', new Date('2026-10-20T00:00:00Z'))).toBeNull();
  });
});
