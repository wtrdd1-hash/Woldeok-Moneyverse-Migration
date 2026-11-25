import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const publicApi = vi.fn();
vi.mock('@/lib/api', () => ({ publicApi: (...a: unknown[]) => publicApi(...a) }));
const { default: Page } = await import('./page');

describe('stock community (QA 2026-11-25: no invented members)', () => {
  it('lists DB posts and nothing invented', async () => {
    publicApi.mockResolvedValue({ ok: true, posts: [{ id: '0b5f3c8e-6a52-4d0e-9a51-6a4f1f3f2b10', title: '실제 글', authorName: 'a', createdAt: '2026-11-24T00:00:00Z', commentCount: 0 }] });
    const html = renderToStaticMarkup(await Page());
    expect(html).toContain('실제 글');
    expect(html).not.toContain('여의도덕이');
  });
  it('shows an empty state for an empty list', async () => {
    publicApi.mockResolvedValue({ ok: true, posts: [] });
    expect(renderToStaticMarkup(await Page())).toContain('아직 종목 토론 글이 없어요');
  });
});
