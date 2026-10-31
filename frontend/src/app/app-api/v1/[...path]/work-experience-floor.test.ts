import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const base = 'https://easy-scraping.com/app-api/v1/work/tasks';
const ctx = { params: Promise.resolve({ path: ['work', 'tasks'] }) };
const headers = { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=private' };
function setup(payload: unknown, status = 200) {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
  const spy = vi.fn(async () => new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } }));
  vi.stubGlobal('fetch', spy);
  return spy;
}
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android member work preview EXP filter', () => {
  it('preserves exact integer strings and forces private no-store/noindex', async () => {
    const spy = setup({ featureState: 'enabled', tasks: [{ task_id: '11111111-1111-4111-8111-111111111111', experience_preview: '9007199254740993' }] });
    const response = await GET(new NextRequest(`${base}?minExperience=9007199254740993`, { headers }), ctx);
    expect(response.status).toBe(200);
    expect(new URL(String(spy.mock.calls[0]?.[0])).searchParams.get('minExperience')).toBe('9007199254740993');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it.each(['minExperience=50&minExperience=50', 'minExperience=01', 'minExperience=1e3', 'minExperience='])('rejects malformed %s before proxy', async (query) => {
    const spy = setup({ featureState: 'enabled', tasks: [] });
    const response = await GET(new NextRequest(`${base}?${query}`, { headers }), ctx);
    expect(response.status).toBe(400);
    expect(spy).not.toHaveBeenCalled();
  });
  it('rejects unverified upstream 200 rather than returning unfiltered tasks', async () => {
    setup({ featureState: 'enabled', tasks: [{ task_id: '11111111-1111-4111-8111-111111111111', experience_preview: '49' }] });
    const response = await GET(new NextRequest(`${base}?minExperience=50`, { headers }), ctx);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
});
