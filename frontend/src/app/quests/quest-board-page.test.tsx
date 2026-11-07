// @vitest-environment node
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ apiOrNull: vi.fn(), requireMember: vi.fn(async () => undefined) }));
vi.mock('@/lib/api', () => ({ apiOrNull: mocks.apiOrNull }));
vi.mock('@/lib/session', () => ({ requireMember: mocks.requireMember }));
vi.mock('./quest-forms', () => ({
  NotificationForm: ({ enabled }: { enabled: boolean | null }) =>
    <div data-testid="quest-notification-preference" data-verified={enabled === null ? 'unknown' : String(enabled)} />,
  NpcOrderButton: () => <button type="button">NPC 주문</button>,
}));
vi.mock('@/components/vip-golden-chest-card', () => ({ VipGoldenChestCard: () => null }));

import QuestsPage, { metadata } from './page';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.apiOrNull.mockImplementation(async (path: string) => path === '/api/v1/engagement' ? null : null);
});

describe('owner quest dashboard server rendering', () => {
  it('does not crash or invent a preference/progress when a legacy response has malformed goals', async () => {
    mocks.apiOrNull.mockImplementation(async (path: string) => path === '/api/v1/engagement'
      ? { today_tasks: { code: 'first_wage' }, weekly_goals: [], next_unlock: null, notifications_enabled: true }
      : null);
    const html = renderToStaticMarkup(await QuestsPage());
    expect(mocks.requireMember).toHaveBeenCalledOnce();
    expect(html).toContain('오늘의 퀘스트를 불러오지 못했어요');
    expect(html).toContain('role="status"');
    expect(html).toContain('다음 해금 단계를 불러오지 못했어요');
    expect(html).toContain('data-verified="unknown"');
    expect(html).not.toContain('기록된 진행');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('shows real zero progress and an explicitly disabled preference when the DB-backed shape is valid', async () => {
    mocks.apiOrNull.mockImplementation(async (path: string) => path === '/api/v1/engagement'
      ? { today_tasks: [{ code: 'first_wage', title: 'First wage', progress: 0 }],
          weekly_goals: [], next_unlock: null, notifications_enabled: false }
      : null);
    const html = renderToStaticMarkup(await QuestsPage());
    expect(html).toContain('첫 급여');
    expect(html).toContain('0회');
    expect(html).toContain('data-verified="false"');
    expect(html).not.toContain('오늘의 퀘스트를 불러오지 못했어요');
  });
});
