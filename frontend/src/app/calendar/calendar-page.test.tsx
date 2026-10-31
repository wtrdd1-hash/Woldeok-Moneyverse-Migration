import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiOrNull, requireMember } = vi.hoisted(() => ({
  apiOrNull: vi.fn(),
  requireMember: vi.fn(async () => undefined),
}));
vi.mock('@/lib/api', () => ({ apiOrNull }));
vi.mock('@/lib/session', () => ({ requireMember }));
import CalendarPage from './page';

const empty = new Map<string, unknown>([
  ['/api/v1/seasons/events', { events: [] }],
  ['/api/v1/early-game/today', { event: null }],
  ['/api/v1/engagement/early-game', { goals: [] }],
  ['/api/v1/shop/catalog', { catalogItems: [] }],
]);

beforeEach(() => {
  vi.clearAllMocks();
  apiOrNull.mockImplementation(async (path: string) => empty.get(path));
});

describe('member calendar SSR source states', () => {
  it('renders verified empty states without an error banner', async () => {
    const html = renderToStaticMarkup(await CalendarPage());
    expect(requireMember).toHaveBeenCalledOnce();
    expect(apiOrNull).toHaveBeenCalledTimes(4);
    expect(html).toContain('오늘 열려 있는 사건이 없어요.');
    expect(html).toContain('현재 진행 중인 시즌 이벤트가 없어요.');
    expect(html).not.toContain('일부 일정을 확인할 수 없습니다.');
  });

  it('does not claim a verified empty calendar when the API returns malformed HTTP 200', async () => {
    apiOrNull.mockImplementation(async (path: string) => path === '/api/v1/seasons/events'
      ? { events: 'invalid' }
      : empty.get(path));
    const html = renderToStaticMarkup(await CalendarPage());
    expect(html).toContain('일부 일정을 확인할 수 없습니다.');
    expect(html).toContain('일정 다시 조회하기');
    expect(html).toContain('role="alert"');
    expect(html).toContain('시즌 이벤트 일정을 불러오지 못했어요.');
    expect(html).not.toContain('현재 진행 중인 시즌 이벤트가 없어요.');
  });

  it('does not render unverified shop prices or forged daily claim states', async () => {
    apiOrNull.mockImplementation(async (path: string) => {
      if (path === '/api/v1/shop/catalog') return { catalogItems: [{ catalog_id: 'forged', name: 'Forged', price: 999 }] };
      if (path === '/api/v1/early-game/today') return { event: { event_label: 'Forged event', claimed: 'true' } };
      return empty.get(path);
    });
    const html = renderToStaticMarkup(await CalendarPage());
    expect(html).toContain('상점 판매 일정을 불러오지 못했어요.');
    expect(html).toContain('오늘의 사건을 불러오지 못했어요.');
    expect(html).not.toContain('Forged event');
    expect(html).not.toContain('Forged');
  });
});
