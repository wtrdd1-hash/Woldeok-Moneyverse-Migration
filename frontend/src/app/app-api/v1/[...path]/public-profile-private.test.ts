import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const memberId = 'a71cc3d1-448a-41d7-bdc4-b6a92252d8a2';
const profile = {
  display_name: 'Member', image_url: null, joined_at: '2026-11-01T12:00:00.000Z',
  job_type: null, job_level: null, work_completions: '9007199254740993',
  visibility: 'members', featured_title: null,
};

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android public profile verification', () => {
  it.each([
    ['valid', { profile: { ...profile, email: 'private@example.com' } }, 200],
    ['wrong shape', { profile: [] }, 503],
    ['bad count', { profile: { ...profile, work_completions: 'NaN' } }, 503],
  ])('%s refuses fabricated 200 and keeps profile private', async (_name, payload, expected) => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(payload), {
      status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
    })));
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/profile/' + memberId), {
      params: Promise.resolve({ path: ['profile', memberId] }),
    });
    expect(response.status).toBe(expected);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    const body = await response.text();
    expect(body).not.toContain('private@example.com');
    if (expected === 200) expect(JSON.parse(body).profile.work_completions).toBe('9007199254740993');
  });

  it('never leaks upstream error details', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response('private db credentials', {
      status: 500, headers: { 'content-type': 'text/plain', 'cache-control': 'public' },
    })));
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/profile/' + memberId), {
      params: Promise.resolve({ path: ['profile', memberId] }),
    });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.text()).not.toContain('private db credentials');
  });
});
