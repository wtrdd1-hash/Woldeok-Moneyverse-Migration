import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import type { DiscordAlertService } from '../discord/discord-alert.service';
import { AdminDiscordOperationsController } from './operations.controller';

const ACTOR = '00000000-0000-4000-8000-000000000001';
afterEach(() => vi.unstubAllEnvs());
function harness() {
  vi.stubEnv('DISCORD_BOT_TOKEN', 'test-token');
  vi.stubEnv('DISCORD_ADMIN_ALERT_USER_ID', '123456789012345678');
  const sendAdminDirectMessage = vi.fn().mockResolvedValue({ success: true, channelId: 'dm-123' });
  const alertWhaleMovement = vi.fn();
  const alertCasinoMegaJackpot = vi.fn();
  const alertTreasuryReserveLow = vi.fn();
  const alertKillSwitchActivated = vi.fn();
  const alertBankDelinquencySpike = vi.fn();
  const discord = {
    getAdminUserId: () => '123456789012345678',
    sendAdminDirectMessage,
    alertWhaleMovement,
    alertCasinoMegaJackpot,
    alertTreasuryReserveLow,
    alertKillSwitchActivated,
    alertBankDelinquencySpike,
  };
  const controller = new AdminDiscordOperationsController(
    null,
    discord as unknown as DiscordAlertService,
  );
  const request = { session: { user_id: ACTOR } } as unknown as RequestWithSession;
  return { controller, request, discord };
}

describe('admin Discord DM test-only delivery', () => {
  it('refuses a missing explicit recipient or bot token rather than using a fallback user', async () => {
    const { controller, request, discord } = harness();
    vi.stubEnv('DISCORD_ADMIN_ALERT_USER_ID', '');
    await expect(controller.testDm(request, { preset: 'default' })).rejects.toThrow(
      ServiceUnavailableException,
    );
    vi.stubEnv('DISCORD_ADMIN_ALERT_USER_ID', '123456789012345678');
    vi.stubEnv('DISCORD_BOT_TOKEN', '');
    await expect(controller.testDm(request, { preset: 'default' })).rejects.toThrow(
      ServiceUnavailableException,
    );
    expect(discord.sendAdminDirectMessage).not.toHaveBeenCalled();
  });

  it.each(['default', 'whale', 'jackpot', 'treasury', 'killswitch', 'bank_delinquency'])(
    'sends %s only as clearly simulated DM',
    async (preset) => {
      const { controller, request, discord } = harness();
      const result = await controller.testDm(request, { preset });
      expect(result).toMatchObject({ success: true, preset, targetUserId: '123456789012345678' });
      expect(discord.sendAdminDirectMessage).toHaveBeenCalledTimes(1);
      const [embed] = discord.sendAdminDirectMessage.mock.calls[0];
      expect(`${embed.title} ${embed.description} ${embed.footer?.text ?? ''}`).toMatch(
        /TEST|테스트|모의/,
      );
      expect(embed.description).toMatch(/실제.*(발생|조치|거래).*아닙니다|실제.*아님/);
      expect(discord.alertWhaleMovement).not.toHaveBeenCalled();
      expect(discord.alertCasinoMegaJackpot).not.toHaveBeenCalled();
      expect(discord.alertTreasuryReserveLow).not.toHaveBeenCalled();
      expect(discord.alertKillSwitchActivated).not.toHaveBeenCalled();
      expect(discord.alertBankDelinquencySpike).not.toHaveBeenCalled();
    },
  );

  it.each(['other', '', '__proto__', 42, null])(
    'rejects invalid preset %s before sending',
    async (preset) => {
      const { controller, request, discord } = harness();
      await expect(controller.testDm(request, { preset } as never)).rejects.toThrow(
        BadRequestException,
      );
      expect(discord.sendAdminDirectMessage).not.toHaveBeenCalled();
    },
  );
});
