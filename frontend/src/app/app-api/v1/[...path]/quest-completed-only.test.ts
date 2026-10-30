import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const base = 'https://easy-scraping.com/app-api/v1/engagement/early-game';
const ctx = { params: Promise.resolve({ path: ['engagement', 'early-game'] }) };
const headers = { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=owner' };
const goal = { goal_code: 'weekly_work', goal_label: 'Work', goal_detail: 'Work', goal_metric: 'work',
  goal_window: 'week', goal_target: '9007199254740993', goal_progress: '9007199254740993',
  goal_unit: 'WLD', goal_self_reported: false, goal_completed: true, week_start: '2026-10-26' };
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('Android verified completed weekly quests', () => {
  it('forwards owner filter and overrides cacheable upstream headers', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ goals: [goal], collections: [] }),
      { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' } }));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(new NextRequest(`${base}?completedOnly=1`, { headers }), ctx);
    expect(response.status).toBe(200);
    expect(new URL(String(fetchSpy.mock.calls[0]?.[0])).searchParams.get('completedOnly')).toBe('1');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('rejects duplicate and invalid query values before proxying', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(); vi.stubGlobal('fetch', fetchSpy);
    expect((await GET(new NextRequest(`${base}?completedOnly=1&completedOnly=1`, { headers }), ctx)).status).toBe(400);
    expect((await GET(new NextRequest(`${base}?completedOnly=true`, { headers }), ctx)).status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('rejects forged uncompleted goals in upstream HTTP 200', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ goals: [{ ...goal, goal_completed: false }], collections: [] }),
      { status: 200, headers: { 'content-type': 'application/json' } })));
    expect((await GET(new NextRequest(`${base}?completedOnly=1`, { headers }), ctx)).status).toBe(503);
  });
});
