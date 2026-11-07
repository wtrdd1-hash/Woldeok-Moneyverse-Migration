import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const mocks = vi.hoisted(() => ({
  apiOrNull: vi.fn(),
  requireMember: vi.fn(async () => undefined),
}));
vi.mock('@/lib/api', () => ({ apiOrNull: mocks.apiOrNull }));
vi.mock('@/lib/session', () => ({ requireMember: mocks.requireMember }));

import CalendarPage, { metadata } from './page';

const season = {
  event_id: '00000000-0000-4000-8000-000000000001',
  season_id: '00000000-0000-4000-8000-000000000002',
  season_name: '실제 시즌',
  title: '검증된 이벤트',
  description: '실제 PostgreSQL 기록',
  cost_wld: '9007199254740993',
  points_per_entry: 4,
  ends_at: '2026-11-15T12:30:00Z',
};

function seed(seasonResponse: unknown) {
  mocks.apiOrNull.mockImplementation(async (path: string) => {
    if (path === '/api/v1/seasons/events') return seasonResponse;
    if (path === '/api/v1/early-game/today') return { event: null };
    if (path === '/api/v1/engagement/early-game') return { goals: [], collections: [] };
    if (path === '/api/v1/shop/catalog') return { catalogItems: [] };
    throw new Error('unexpected backend path');
  });
}

describe('member season calendar SSR integration', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('fails closed on malformed successful season data without crashing or claiming verified empty', async () => {
    seed({ events: [null] });
    const html = renderToStaticMarkup(await CalendarPage());
    expect(mocks.requireMember).toHaveBeenCalledOnce();
    expect(html).toContain('role="alert"');
    expect(html).toContain('서버 응답을 검증하지 못했습니다');
    expect(html).toContain('href="/calendar"');
    expect(html).not.toContain('현재 진행 중인 시즌 이벤트가 없어요');
  });

  it('distinguishes a verified empty season from an outage', async () => {
    seed({ events: [] });
    const html = renderToStaticMarkup(await CalendarPage());
    expect(html).toContain('현재 진행 중인 시즌 이벤트가 없어요');
    expect(html).not.toContain('서버 응답을 검증하지 못했습니다');
  });

  it('renders only verified exact-WLD server events and keeps SEO private', async () => {
    seed({ events: [season] });
    const html = renderToStaticMarkup(await CalendarPage());
    expect(html).toContain('검증된 이벤트');
    expect(html).toContain('9,007,199,254,740,993');
    expect(html).not.toContain('서버 응답을 검증하지 못했습니다');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
