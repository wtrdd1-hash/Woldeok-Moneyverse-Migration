// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { viewerMock, adminMock, apiMock } = vi.hoisted(() => ({
  viewerMock: vi.fn(),
  adminMock: vi.fn(),
  apiMock: vi.fn(),
}));
vi.mock('@/lib/viewer', () => ({
  currentViewer: viewerMock,
  isAdministrator: adminMock,
}));

vi.mock('@/lib/api', () => ({ api: apiMock }));

import { POST } from './route';

const originalSecret = process.env.INTERNAL_API_SECRET;
const originalCron = process.env.CRON_SECRET;
const validSecret = 'security-test-internal-secret-32-chars-minimum';

function request(body: unknown = { title: 'System test', description: 'Test message', type: 'TEST' }, headers: Record<string, string> = {}) {
  return new Request('https://easy-scraping.com/api/discord/broadcast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

function botReceipt(value: unknown = { ok: true, status: 'Broadcast sent to Discord' }, status = 200) {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(value), {
    status, headers: { 'Content-Type': 'application/json' },
  })));
}

describe('P0 Discord broadcast ingress authentication and delivery evidence', () => {
  beforeEach(() => {
    delete process.env.INTERNAL_API_SECRET;
    delete process.env.CRON_SECRET;
    vi.resetAllMocks();
    viewerMock.mockResolvedValue(null);
    adminMock.mockReturnValue(false);
    apiMock.mockResolvedValue({ consoleSession: { state: 'open' } });
    botReceipt();
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.INTERNAL_API_SECRET;
    else process.env.INTERNAL_API_SECRET = originalSecret;
    if (originalCron === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = originalCron;
    vi.unstubAllGlobals();
  });

  it('rejects the historical hardcoded fallback credential when no secret is configured', async () => {
    const response = await POST(request(undefined, { 'x-internal-secret': 'mv-internal-secure-key-2026' }));
    expect(response.status).toBe(403);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it('does not accept a configured weak secret or missing internal authentication', async () => {
    process.env.INTERNAL_API_SECRET = 'short';
    expect((await POST(request(undefined, { 'x-internal-secret': 'short' }))).status).toBe(403);
    expect((await POST(request())).status).toBe(403);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it('blocks an administrator when the browser Origin is absent or cross-site', async () => {
    process.env.INTERNAL_API_SECRET = validSecret;
    adminMock.mockReturnValue(true);
    expect((await POST(request())).status).toBe(403);
    expect((await POST(request(undefined, { origin: 'https://attacker.invalid', 'sec-fetch-site': 'cross-site' }))).status).toBe(403);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it('rejects an administrator whose elevated console session is locked or cannot be verified', async () => {
    process.env.INTERNAL_API_SECRET = validSecret;
    adminMock.mockReturnValue(true);
    apiMock.mockResolvedValueOnce({ consoleSession: { state: 'locked' } });
    expect((await POST(request(undefined, { origin: 'https://easy-scraping.com' }))).status).toBe(403);
    apiMock.mockRejectedValueOnce(new Error('backend unavailable'));
    expect((await POST(request(undefined, { origin: 'https://easy-scraping.com' }))).status).toBe(403);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it('permits a same-origin administrator and records a verified bot receipt', async () => {
    process.env.INTERNAL_API_SECRET = validSecret;
    adminMock.mockReturnValue(true);
    const response = await POST(request(undefined, { origin: 'https://easy-scraping.com', 'sec-fetch-site': 'same-origin' }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, deliveredToBot: true });
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });

  it('permits a configured strong internal credential without a browser Origin', async () => {
    process.env.INTERNAL_API_SECRET = validSecret;
    const response = await POST(request(undefined, { 'x-internal-secret': validSecret }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, deliveredToBot: true });
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      headers: expect.objectContaining({ 'x-internal-secret': validSecret }),
    }));
  });

  it('refuses bot dispatch if no strong transport credential is configured', async () => {
    adminMock.mockReturnValue(true);
    const response = await POST(request(undefined, { origin: 'https://easy-scraping.com' }));
    expect(response.status).toBe(503);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it.each([
    { title: '' },
    { title: 'a'.repeat(257) },
    { title: 'ok', description: 'x'.repeat(4097) },
    { title: 'ok', fields: Array(26).fill({ name: 'x', value: 'y' }) },
    { title: 'ok', fields: [{ name: 'x', value: '' }] },
    { title: 'ok', color: -1 },
    { title: 'ok', notifyAdminDm: 'yes' },
    { title: 'ok', type: 'BAD\nEVENT' },
    [],
    null,
  ])('rejects malformed or unbounded broadcast payloads before bot dispatch: %j', async (body) => {
    process.env.INTERNAL_API_SECRET = validSecret;
    const response = await POST(request(body, { 'x-internal-secret': validSecret }));
    expect(response.status).toBe(400);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it.each([
    [{ ok: false }, 200],
    [{ ok: true }, 200],
    [{ ok: 'true', status: 'Broadcast sent to Discord' }, 200],
    [{ ok: true, status: 'Broadcast sent to Discord' }, 502],
  ] as const)('never calls an unverified or failed bot reply a delivery: %j', async (body, status) => {
    process.env.INTERNAL_API_SECRET = validSecret;
    botReceipt(body, status);
    const response = await POST(request(undefined, { 'x-internal-secret': validSecret }));
    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ ok: false, deliveredToBot: false });
  });

  it('rejects an oversized body before forwarding to the bot', async () => {
    process.env.INTERNAL_API_SECRET = validSecret;
    const response = await POST(request({ title: 'ok', description: 'x'.repeat(17000) },
      { 'x-internal-secret': validSecret }));
    expect(response.status).toBe(413);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it('rejects non-JSON content types before forwarding to the bot', async () => {
    process.env.INTERNAL_API_SECRET = validSecret;
    const response = await POST(new Request('https://easy-scraping.com/api/discord/broadcast', {
      method: 'POST', headers: { 'x-internal-secret': validSecret, 'Content-Type': 'text/plain' },
      body: 'title=forged',
    }));
    expect(response.status).toBe(400);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it('rejects malformed bot JSON instead of silently inventing success', async () => {
    process.env.INTERNAL_API_SECRET = validSecret;
    vi.stubGlobal('fetch', vi.fn(async () => new Response('not-json', { status: 200 })));
    const response = await POST(request(undefined, { 'x-internal-secret': validSecret }));
    expect(response.status).toBe(502);
  });
});
