import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('@/lib/api', () => ({ publicApi: vi.fn().mockResolvedValue({ announcements: [] }) }));
import AnnouncementsPage, { generateMetadata } from './page';

describe('announcement image search accessibility and SEO', () => {
  it('provides an accessible labelled search with truthful 20-row scope and noindex', async () => {
    const searchParams = Promise.resolve({ imageAlt: '제주' });
    const html = renderToStaticMarkup(await AnnouncementsPage({ searchParams }));
    expect(html).toContain('role="search"');
    expect(html).toContain('name="imageAlt"');
    expect(html).toContain('최근 공개 공지 20건');
    expect(html).toContain('일치하는 이미지 설명이 없어요');
    expect((await generateMetadata({ searchParams })).robots).toEqual({ index: false, follow: true });
  });
  it('keeps the unfiltered indexable landing page', async () => {
    expect((await generateMetadata({ searchParams: Promise.resolve({}) })).robots).toEqual({
      index: true, follow: true,
    });
  });
});
