import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import config from '../../../../next.config';
import { GET } from '../../app-api/v1/[...path]/route';

const page = readFileSync(join(process.cwd(), 'src/app/account/privacy/page.tsx'), 'utf8');
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('privacy history web and Android edge', () => {
  it('renders only validated history and provides an accessible retry on source failure', () => {
    expect(page).toContain('parsePrivacyRequestHistory(');
    expect(page).toContain('role="alert"');
    expect(page).toContain('href={selectedType ? `/account/privacy?type=${selectedType}` : "/account/privacy"}');
  });

  it('enforces private noindex/no-referrer headers on the actual member page', async () => {
    vi.stubEnv('SEO_INDEXING_ENABLED', 'true');
    const rules = await config.headers!();
    const privacy = rules.find((rule) => rule.source === '/account/privacy');
    expect(privacy).toBeDefined();
    const headers = new Map(privacy!.headers.map((entry) => [entry.key, entry.value]));
    expect(headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(headers.get('cache-control')).toBe('private, no-store');
    expect(headers.get('referrer-policy')).toBe('no-referrer');
  });

  it.each([200, 503])('protects Android privacy responses with status %i', async (status) => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only-token');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(status === 200 ? { requests: [] } : { message: 'offline' }), {
      status, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400', 'x-robots-tag': 'index, follow', 'referrer-policy': 'unsafe-url' },
    })));
    const req = new NextRequest('https://easy-scraping.com/app-api/v1/privacy/requests', { headers: { cookie: 'moneyverse_session=owner' } });
    const response = await GET(req, { params: Promise.resolve({ path: ['privacy', 'requests'] }) });
    expect(response.status).toBe(status);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });

  it('rejects a success-shaped but malformed Android history', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only-token');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ requests: [{ requestId: 'bad' }] }), {
      status: 200, headers: { 'content-type': 'application/json' },
    })));
    const req = new NextRequest('https://easy-scraping.com/app-api/v1/privacy/requests');
    const response = await GET(req, { params: Promise.resolve({ path: ['privacy', 'requests'] }) });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
});
