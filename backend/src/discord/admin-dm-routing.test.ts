import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Pool } from 'pg';
import * as ssrfDefense from '../security/ssrf-defense';
import { DiscordAlertService } from './discord-alert.service';

describe('Discord operational alert routing', () => {
  const originalEnv = process.env;
  let service: DiscordAlertService;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      DISCORD_BOT_TOKEN: 'fake-bot-token',
      DISCORD_ADMIN_ALERT_USER_ID: '123456789012345678',
      DISCORD_ALERT_CHANNEL_ID: '987654321098765432',
      DISCORD_ADMIN_DM_ENABLED: 'true',
    };
    delete process.env.DISCORD_ALERT_WEBHOOK_URL;
    service = new DiscordAlertService({} as Pool);
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('sends operational channel alerts to the administrator DM as well', async () => {
    const requests: Array<{ path: string; payload: Record<string, unknown> }> = [];
    vi.spyOn(ssrfDefense, 'safeFetch').mockImplementation(async (url, options) => {
      const path = String(url);
      requests.push({
        path,
        payload: JSON.parse(String(options?.body)) as Record<string, unknown>,
      });
      if (path.endsWith('/users/@me/channels')) {
        return new Response(JSON.stringify({ id: 'dm-123' }), { status: 200 });
      }
      return new Response('{}', { status: 200 });
    });

    await expect(
      service.sendDiscordEmbed({
        title: 'Admin warning',
        description: 'System needs attention',
        color: 0xf59e0b,
      }),
    ).resolves.toBe(true);

    expect(requests.map((r) => r.path)).toEqual([
      expect.stringContaining('/channels/987654321098765432/messages'),
      expect.stringContaining('/users/@me/channels'),
      expect.stringContaining('/channels/dm-123/messages'),
    ]);
    expect(requests[0]?.payload.allowed_mentions).toEqual({ parse: [] });
    expect(requests[2]?.payload.allowed_mentions).toEqual({ parse: [] });
  });

  it('reports success if the channel fails but the private alert is delivered', async () => {
    vi.spyOn(ssrfDefense, 'safeFetch').mockImplementation(async (url) => {
      const path = String(url);
      if (path.includes('/987654321098765432/messages'))
        return new Response('offline', { status: 503 });
      if (path.endsWith('/users/@me/channels'))
        return new Response(JSON.stringify({ id: 'dm-abc' }), { status: 200 });
      return new Response('{}', { status: 200 });
    });

    await expect(
      service.sendDiscordEmbed({ title: 'Critical', color: 0xef4444 }, true),
    ).resolves.toBe(true);
  });

  it('honors an explicit DM disable without dropping channel alerts', async () => {
    process.env.DISCORD_ADMIN_DM_ENABLED = 'false';
    const fetchSpy = vi
      .spyOn(ssrfDefense, 'safeFetch')
      .mockResolvedValue(new Response('{}', { status: 200 }));

    await expect(service.sendDiscordEmbed({ title: 'Routine', color: 0x10b981 })).resolves.toBe(
      true,
    );
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('keeps DM channel cache isolated per recipient', async () => {
    const dmIds: string[] = [];
    const fetchSpy = vi.spyOn(ssrfDefense, 'safeFetch').mockImplementation(async (url, options) => {
      if (String(url).endsWith('/users/@me/channels')) {
        const input = JSON.parse(String(options?.body)) as { recipient_id: string };
        dmIds.push(input.recipient_id);
        return new Response(JSON.stringify({ id: 'dm-' + input.recipient_id }), { status: 200 });
      }
      return new Response('{}', { status: 200 });
    });
    await service.sendAdminDirectMessage({ title: 'First', color: 1 }, '111111111111111111');
    await service.sendAdminDirectMessage({ title: 'Second', color: 1 }, '222222222222222222');
    expect(dmIds).toEqual(['111111111111111111', '222222222222222222']);
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/channels/dm-222222222222222222/messages'),
      expect.anything(),
    );
  });

  it('redacts credential-like text in outbound Discord alert bodies', async () => {
    const requests: string[] = [];
    vi.spyOn(ssrfDefense, 'safeFetch').mockImplementation(async (url, options) => {
      requests.push(String(options?.body));
      if (String(url).endsWith('/users/@me/channels'))
        return new Response(JSON.stringify({ id: 'dm-123' }), { status: 200 });
      return new Response('{}', { status: 200 });
    });

    await service.sendDiscordEmbed({
      title: '@everyone Error',
      description: 'Authorization: Bearer super-secret-test-value',
      fields: [{ name: 'Credentials', value: 'password=unsafe-password' }],
      color: 0xef4444,
    });
    expect(requests.join(' ')).not.toContain('super-secret-test-value');
    expect(requests.join(' ')).not.toContain('unsafe-password');
  });
});
