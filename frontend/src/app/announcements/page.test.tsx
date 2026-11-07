import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';

vi.mock('@/lib/api', () => ({ publicApi: vi.fn() }));
vi.mock('@/components/public-advertisement', () => ({ PublicAdvertisement: () => null }));

import { publicApi } from '@/lib/api';
import AnnouncementsPage, { generateMetadata } from './page';

afterEach(() => { vi.clearAllMocks(); });

describe('public announcement Seoul-day web discovery', () => {
  it('keeps the canonical unfiltered page indexable and filtered pages noindex', async () => {
    const base = await generateMetadata({ searchParams: Promise.resolve({}) });
    const filtered = await generateMetadata({ searchParams: Promise.resolve({ day: '2026-09-18' }) });
    expect(base.robots).toBeUndefined();
    expect(filtered.robots).toEqual({ index: false, follow: false });
    expect(filtered.alternates).toEqual(base.alternates);
  });

  it('shows a labeled date form and makes a non-cacheable bounded query', async () => {
    vi.mocked(publicApi).mockResolvedValue({ publicationDay: '2026-09-18', announcements: [] });
    const page = await AnnouncementsPage({ searchParams: Promise.resolve({ day: '2026-09-18' }) });
    const html = renderToStaticMarkup(createElement('div', null, page));
    expect(html).toContain('name="day"');
    expect(html).toContain('게시일 (한국시간)');
    expect(html).toContain('최근 공개 공지 최대 20건');
    expect(html).toContain('검색 초기화');
    expect(publicApi).toHaveBeenCalledWith('/api/v1/announcements?day=2026-09-18', 0);
  });

  it('refuses invalid dates without making an API request', async () => {
    const page = await AnnouncementsPage({ searchParams: Promise.resolve({ day: '2026-02-29' }) });
    const html = renderToStaticMarkup(createElement('div', null, page));
    expect(html).toContain('올바른 게시일');
    expect(publicApi).not.toHaveBeenCalled();
  });
});
