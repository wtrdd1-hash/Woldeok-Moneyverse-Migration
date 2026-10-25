import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
const { viewer, admin } = vi.hoisted(() => ({ viewer: vi.fn(), admin: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ currentViewer: viewer, isAdministrator: admin }));
import { POST } from './route';

const inbound = 'scheduler-test-credential-32-characters-long';
const outbound = 'bot-broadcast-test-credential-32-chars-long';
const request = (headers: Record<string, string> = {}) => new Request('https://easy-scraping.com/api/discord/broadcast', {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify({ title: 'Verified test broadcast' }),
});

describe('broadcast authentication and transport boundaries', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    vi.resetAllMocks();
    delete process.env.INTERNAL_API_SECRET;
    delete process.env.CRON_SECRET;
    delete process.env.DISCORD_BROADCAST_SECRET;
    viewer.mockResolvedValue(null);
    admin.mockReturnValue(false);
    fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('rejects the historical static default even if outbound credentials are configured', async () => {
    process.env.DISCORD_BROADCAST_SECRET = outbound;
    expect((await POST(request({ 'x-internal-secret': ['mv', 'internal', 'secure', 'key', '2026'].join('-') }))).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a cross-origin administrator browser POST without forwarding', async () => {
    process.env.DISCORD_BROADCAST_SECRET = outbound;
    admin.mockReturnValue(true);
    expect((await POST(request({ origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' }))).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fails closed without an outbound bot credential even for a same-origin admin', async () => {
    admin.mockReturnValue(true);
    const res = await POST(request({ origin: 'https://easy-scraping.com', 'sec-fetch-site': 'same-origin' }));
    expect(res.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('allows a valid scheduler credential and forwards only the dedicated bot secret', async () => {
    process.env.INTERNAL_API_SECRET = inbound;
    process.env.DISCORD_BROADCAST_SECRET = outbound;
    const res = await POST(request({ 'x-internal-secret': inbound }));
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String), expect.objectContaining({ headers: expect.objectContaining({ 'x-internal-secret': outbound }) }),
    );
  });

  it('does not allow the blog cron credential to send Discord broadcasts', async () => {
    process.env.CRON_SECRET = inbound;
    process.env.DISCORD_BROADCAST_SECRET = outbound;
    expect((await POST(request({ 'x-cron-secret': inbound }))).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a short scheduler secret instead of treating it as valid', async () => {
    process.env.INTERNAL_API_SECRET = 'short';
    process.env.DISCORD_BROADCAST_SECRET = outbound;
    expect((await POST(request({ 'x-internal-secret': 'short' }))).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
