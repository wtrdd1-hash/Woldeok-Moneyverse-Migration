import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const { apiMock, memberMock } = vi.hoisted(() => ({ apiMock: vi.fn(), memberMock: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: apiMock }));
vi.mock('@/lib/session', () => ({ requireMember: memberMock }));
import CalendarPage, { metadata } from './page';

const goal = {
  goal_code: 'weekly_tasks', goal_label: 'Weekly tasks', goal_detail: 'Work',
  goal_metric: 'distinct_work_tasks', goal_window: 'week',
  goal_target: '3', goal_progress: '1', goal_unit: 'times',
  goal_self_reported: false, goal_completed: false, week_start: '2026-11-02',
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-03T00:00:00.000Z'));
  vi.clearAllMocks();
  memberMock.mockResolvedValue(undefined);
  apiMock.mockImplementation(async (path: string) => path.includes('early-game')
    ? { goals: [], collections: [] }
    : path.includes('seasons/events') ? { events: [] }
    : path.includes('early-game/today') ? { event: null }
    : { catalogItems: [] });
});
afterEach(() => vi.useRealTimers());

describe('calendar verified weekly reset source', () => {
  it('does not turn malformed HTTP 200 into a real empty weekly schedule', async () => {
    apiMock.mockImplementation(async (path: string) => path.endsWith('/engagement/early-game')
      ? { goals: 'not-an-array', collections: [] }
      : path.endsWith('/seasons/events') ? { events: [] }
      : path.endsWith('/early-game/today') ? { event: null }
      : { catalogItems: [] });
    const html = renderToStaticMarkup(await CalendarPage());
    expect(memberMock).toHaveBeenCalled();
    expect(html).toContain('주간 목표 일정을 확인할 수 없어요');
    expect(html).toContain('다시 확인');
    expect(html).not.toContain('현재 주간 목표가 없어요');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('renders a source-backed KST reset and weekly count without lifetime goals', async () => {
    apiMock.mockImplementation(async (path: string) => path.endsWith('/engagement/early-game')
      ? { goals: [goal, { ...goal, goal_code: 'npc', goal_window: 'lifetime' }], collections: [] }
      : path.endsWith('/seasons/events') ? { events: [] }
      : path.endsWith('/early-game/today') ? { event: null }
      : { catalogItems: [] });
    const html = renderToStaticMarkup(await CalendarPage());
    expect(html).toContain('이번 주 목표 1');
    expect(html).toContain('2026-11-02');
    expect(html).not.toContain('주간 목표 일정을 확인할 수 없어요');
  });
});
