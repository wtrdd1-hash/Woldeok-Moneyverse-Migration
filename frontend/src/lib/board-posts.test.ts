import { describe, expect, it } from 'vitest';
import { readBoardPosts } from './board-posts';

/**
 * Production regression 2026-11-25: /board and sitemap-board.xml linked to
 * /board/undefined. The page read `postId` from Spring's placeholder endpoint,
 * which returns one hard-coded post with `id: "stock-post-01"`.
 */
const ID = '0b5f3c8e-6a52-4d0e-9a51-6a4f1f3f2b10';

describe('readBoardPosts', () => {
  it('reads the DB-backed Spring list (BoardPostItem: id, stockSymbol)', () => {
    const [p] = readBoardPosts({ ok: true, posts: [{ id: ID, authorName: '회원', title: '제목', stockSymbol: 'WDG', commentCount: 2, createdAt: '2026-11-24T00:00:00Z' }] });
    expect(p).toMatchObject({ postId: ID, title: '제목', authorName: '회원', commentCount: 2, stock: { symbol: 'WDG' } });
  });
  it('reads the canonical list (postId, stock object)', () => {
    const [p] = readBoardPosts({ posts: [{ postId: ID, title: 't', authorName: 'a', createdAt: '2026-11-24T00:00:00Z', updatedAt: null, commentCount: 0, mine: false, stock: null }] });
    expect(p!.postId).toBe(ID);
  });
  it('drops rows without a database id, so no /board/undefined link is ever rendered', () => {
    expect(readBoardPosts({ posts: [{ id: 'stock-post-01', title: '삼성전자 파운드리', authorName: '여의도 분석가', createdAt: 'x' }, { title: 'no id' }] })).toEqual([]);
  });
  it('treats a non-list body as unavailable', () => {
    expect(readBoardPosts({ status: 404 })).toBeNull();
    expect(readBoardPosts(null)).toBeNull();
  });
});
