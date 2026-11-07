import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBoardTitleQuery, parseBoardTitleMatch } from './board-title-search';
import { isVerifiedExactBoard } from '@/lib/board-exact-title';

describe('public board title search', () => {
  it('normalizes a bounded title query without inventing a global search', () => {
    expect(parseBoardTitleQuery(undefined)).toEqual({ query: null, invalid: false });
    expect(parseBoardTitleQuery('  제주  ')).toEqual({ query: '제주', invalid: false });
  });
  it.each(['', '   ', ['one', 'two'], 'x'.repeat(81), 'a\nb', '<script>'])(
    'rejects invalid query %j',
    (value) => {
      expect(parseBoardTitleQuery(value).invalid).toBe(true);
    },
  );
  it('renders accessible GET search and states the latest-50 scope, without indexing filtered results', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('role="search"');
    expect(page).toContain('name="q"');
    expect(page).toContain('최근 공개 게시글 50건');
    expect(page).toContain('robots: { index: !hasSearch');
  });
});


describe('exact title selector', () => {
  it('allows only exact or omitted mode, and requires a title query', () => {
    expect(parseBoardTitleMatch(undefined, 'WLD')).toEqual({ mode: null, invalid: false });
    expect(parseBoardTitleMatch('exact', 'WLD')).toEqual({ mode: 'exact', invalid: false });
    expect(parseBoardTitleMatch('exact', null).invalid).toBe(true);
    expect(parseBoardTitleMatch(['exact', 'exact'], 'WLD').invalid).toBe(true);
  });
  it('renders a labeled exact title mode with noindex and fail-closed response proof', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('name="match"');
    expect(page).toContain('titleMatch');
  });
});


describe('exact title response integrity', () => {
  const post = { postId:'00000000-0000-4000-8000-000000000001', title:'WLD', authorName:'user', createdAt:'2026-11-02T00:00:00.000Z', commentCount:0, mine:false, stock:null };
  it('rejects legacy, mismatched, duplicate or oversized evidence', () => {
    expect(isVerifiedExactBoard({posts:[]}, 'WLD')).toBe(false);
    expect(isVerifiedExactBoard({posts:[{...post,title:'WLD news'}],titleMatch:'exact',titleQuery:'WLD'},'WLD')).toBe(false);
    expect(isVerifiedExactBoard({posts:[post,{...post,postId:post.postId.toUpperCase()}],titleMatch:'exact',titleQuery:'WLD'},'WLD')).toBe(false);
    expect(isVerifiedExactBoard({posts:[post],titleMatch:'exact',titleQuery:'WLD'},'WLD','WDX')).toBe(false);
    expect(isVerifiedExactBoard({posts:Array(51).fill(post),titleMatch:'exact',titleQuery:'WLD'},'WLD')).toBe(false);
  });
  it('accepts a verified empty and matching bounded post', () => {
    expect(isVerifiedExactBoard({posts:[],titleMatch:'exact',titleQuery:'WLD'},'WLD')).toBe(true);
    expect(isVerifiedExactBoard({posts:[post],titleMatch:'exact',titleQuery:'WLD'},'WLD')).toBe(true);
  });
});
