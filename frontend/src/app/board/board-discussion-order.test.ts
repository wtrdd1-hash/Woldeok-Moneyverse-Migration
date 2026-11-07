import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBoardDiscussionOrder } from './board-discussion-order';

describe('public board most-discussed sort', () => {
  it('keeps recent as default and recognizes the explicit discussed order', () => {
    expect(parseBoardDiscussionOrder(undefined)).toEqual({ order: 'recent', invalid: false });
    expect(parseBoardDiscussionOrder('discussed')).toEqual({ order: 'discussed', invalid: false });
  });
  it.each(['', 'popular', ['recent', 'discussed'], null, 3])('rejects invalid or repeated sort %j', (value) => {
    expect(parseBoardDiscussionOrder(value).invalid).toBe(true);
  });
  it('renders an accessible select and blocks indexing of sorted public search', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('name="sort"');
    expect(page).toContain('htmlFor="board-discussion-order"');
    expect(page).toContain('params.sort !== undefined');
    expect(page).toContain("query.set('sort', order.order)");
  });
});

describe('generated Android board contract parity', () => {
  it('retains the posts schema and adds optional source-applied sort proof', () => {
    const contract = JSON.parse(readFileSync('../docs/mobile-api-contract.json', 'utf8')) as {
      endpoints: { path: string; responseSchema?: { properties?: Record<string, unknown> } }[];
    };
    const endpoint = contract.endpoints.find((entry) => entry.path === '/app-api/v1/board/public/stock-posts');
    expect(endpoint?.responseSchema?.properties).toHaveProperty('posts');
    expect(endpoint?.responseSchema?.properties).toHaveProperty('sortApplied');
  });
});
