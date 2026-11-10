import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminChannelOtpService, parseAdminOtpIntent } from './admin-channel-otp.service';
import type { TelegramAlertService } from '../telegram/telegram-alert.service';
import type { DiscordAlertService } from '../discord/discord-alert.service';

const mint = {
  action: 'treasury_mint_topup' as const,
  amountWld: '1000000',
  reason: 'approved Treasury liquidity operation',
  requestKey: '77e539ef-1019-4e6a-92c5-3d9b405ea609',
};
const salary = {
  action: 'treasury_salary_disburse' as const,
  amountWld: '100000',
  reason: 'monthly administrator wage',
  targetAdminId: 'a9461a37-2780-4340-a312-8069c9570831',
};

describe('AdminChannelOtpService — bound administrator step-up', () => {
  let telegram: { sendAlert: ReturnType<typeof vi.fn> };
  let discord: { sendAdminDirectMessage: ReturnType<typeof vi.fn> };
  let service: AdminChannelOtpService;

  const extractCode = () => {
    const embed = discord.sendAdminDirectMessage.mock.calls.at(-1)?.[0] as { description?: string };
    return /\[ (\d{6}) \]/.exec(embed.description || '')?.[1] || '';
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-10T04:00:00.000Z'));
    telegram = { sendAlert: vi.fn().mockResolvedValue(true) };
    discord = { sendAdminDirectMessage: vi.fn().mockResolvedValue({ success: true }) };
    service = new AdminChannelOtpService(
      telegram as unknown as TelegramAlertService,
      discord as unknown as DiscordAlertService,
    );
  });
  afterEach(() => vi.useRealTimers());

  it('delivers to both channels without returning plaintext and verifies once', async () => {
    const result = await service.requestOtp('admin-a', 'console-session-a', mint);
    expect(result.success).toBe(true);
    expect(result).not.toHaveProperty('code');
    expect(telegram.sendAlert).toHaveBeenCalledTimes(1);
    expect(discord.sendAdminDirectMessage).toHaveBeenCalledTimes(1);
    const code = extractCode();
    expect(code).toMatch(/^\d{6}$/);
    expect(service.verifyOtp('admin-a', 'console-session-a', mint, code)).toBe(true);
    expect(service.verifyOtp('admin-a', 'console-session-a', mint, code)).toBe(false);
  });

  it.each([
    ['Telegram refused', false, { success: true }],
    ['Discord refused', true, { success: false }],
  ])('fails closed if %s', async (_description, telegramResult, discordResult) => {
    telegram.sendAlert.mockResolvedValue(telegramResult);
    discord.sendAdminDirectMessage.mockResolvedValue(discordResult);
    await expect(service.requestOtp('admin-a', 'console-session-a', mint)).rejects.toThrow();
    expect(service.verifyOtp('admin-a', 'console-session-a', mint, extractCode())).toBe(false);
  });

  it('rejects missing transport rather than skipping delivery', async () => {
    const unavailable = new AdminChannelOtpService();
    await expect(unavailable.requestOtp('admin-a', 'console-session-a', mint)).rejects.toThrow();
  });

  it('binds code to the exact administrator, admin session, action, amount and reason', async () => {
    await service.requestOtp('admin-a', 'console-session-a', mint);
    const code = extractCode();
    expect(service.verifyOtp('admin-b', 'console-session-a', mint, code)).toBe(false);
    expect(service.verifyOtp('admin-a', 'other-session', mint, code)).toBe(false);
    expect(service.verifyOtp('admin-a', 'console-session-a', salary, code)).toBe(false);
    expect(service.verifyOtp('admin-a', 'console-session-a', { ...mint, amountWld: '1000001' }, code)).toBe(false);
    expect(service.verifyOtp('admin-a', 'console-session-a', { ...mint, reason: 'altered reason' }, code)).toBe(false);
    expect(service.verifyOtp('admin-a', 'console-session-a', mint, code)).toBe(true);
  });

  it('expires at five minutes', async () => {
    await service.requestOtp('admin-a', 'console-session-a', mint);
    const code = extractCode();
    vi.advanceTimersByTime(300_001);
    expect(service.verifyOtp('admin-a', 'console-session-a', mint, code)).toBe(false);
  });

  it('invalidates after five attempts and throttles repeat issuance', async () => {
    await service.requestOtp('admin-a', 'console-session-a', mint);
    const code = extractCode();
    await expect(service.requestOtp('admin-a', 'console-session-a', mint)).rejects.toThrow();
    for (let i = 0; i < 5; i++) {
      expect(service.verifyOtp('admin-a', 'console-session-a', mint, '000000')).toBe(false);
    }
    expect(service.verifyOtp('admin-a', 'console-session-a', mint, code)).toBe(false);
  });

  it('rejects invalid or attacker-supplied action/body fields', () => {
    expect(() => parseAdminOtpIntent({ ...mint, action: 'admin_delete_all' })).toThrow();
    expect(() => parseAdminOtpIntent({ ...mint, amountWld: '-1' })).toThrow();
    expect(() => parseAdminOtpIntent({ ...mint, requestKey: 'not-a-uuid' })).toThrow();
    expect(() => parseAdminOtpIntent({ ...mint, targetAdminId: salary.targetAdminId })).toThrow();
    expect(() => parseAdminOtpIntent({ ...salary, targetAdminId: 'wrong-id' })).toThrow();
  });
});
