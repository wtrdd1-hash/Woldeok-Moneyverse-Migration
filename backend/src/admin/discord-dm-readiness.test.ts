import { afterEach, describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { AdminDiscordOperationsController, resolveAdminDmConfiguration } from './operations.controller';
import type { DiscordAlertService } from '../discord/discord-alert.service';
import type { OperationsRepository } from './operations.repository';

const alert = { getAdminUserId: () => '123456789012345678' } as DiscordAlertService;
const env = { DISCORD_BOT_TOKEN: 'token', DISCORD_ADMIN_ALERT_USER_ID: '123456789012345678' };

describe('administrator Discord DM readiness', () => {
  afterEach(() => vi.unstubAllEnvs());
  it('requires an alert service and explicit token and recipient before reporting configuration', () => {
    expect(resolveAdminDmConfiguration(env, null)).toEqual({ configured: false, adminUserId: null });
    expect(resolveAdminDmConfiguration({ ...env, DISCORD_BOT_TOKEN: '' }, alert)).toEqual({ configured: false, adminUserId: null });
    expect(resolveAdminDmConfiguration({ ...env, DISCORD_ADMIN_ALERT_USER_ID: '' }, alert)).toEqual({ configured: false, adminUserId: null });
  });

  it('rejects malformed Discord recipients instead of displaying a fallback recipient', () => {
    expect(resolveAdminDmConfiguration({ ...env, DISCORD_ADMIN_ALERT_USER_ID: 'not-an-id' }, alert))
      .toEqual({ configured: false, adminUserId: null });
  });

  it('blocks the actual DM endpoint before transport when the explicit recipient is absent', async () => {
    vi.stubEnv('DISCORD_BOT_TOKEN', 'token');
    vi.stubEnv('DISCORD_ADMIN_ALERT_USER_ID', '');
    const transport = { getAdminUserId: vi.fn(() => '123456789012345678'), sendAdminDirectMessage: vi.fn() };
    const controller = new AdminDiscordOperationsController({} as OperationsRepository, transport as unknown as DiscordAlertService);
    const request = { session: { user_id: 'test-actor' } } as Parameters<typeof controller.testDm>[0];
    await expect(controller.testDm(request)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(transport.sendAdminDirectMessage).not.toHaveBeenCalled();
  });

  it('reports only explicit valid recipient configuration, not delivery success', () => {
    expect(resolveAdminDmConfiguration(env, alert)).toEqual({ configured: true, adminUserId: env.DISCORD_ADMIN_ALERT_USER_ID });
  });
});
