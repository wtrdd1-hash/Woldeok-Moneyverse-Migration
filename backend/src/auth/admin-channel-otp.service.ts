import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { timingSafeEqual, randomInt } from 'node:crypto';
import { TelegramAlertService } from '../telegram/telegram-alert.service';
import { DiscordAlertService } from '../discord/discord-alert.service';

export interface OtpSession {
  readonly code: string;
  readonly expiresAt: number;
  readonly actionName: string;
  readonly createdAt: number;
}

@Injectable()
export class AdminChannelOtpService {
  private readonly logger = new Logger(AdminChannelOtpService.name);
  private readonly otpStore = new Map<string, OtpSession>();
  private readonly TTL_MS = 5 * 60 * 1000; // 5분

  constructor(
    private readonly telegramAlertService?: TelegramAlertService,
    private readonly discordAlertService?: DiscordAlertService,
  ) {}

  /**
   * 6자리 일회용 OTP 코드를 생성하고 텔레그램 및 디스코드로 동시 발송합니다.
   */
  async requestOtp(adminUserId: string, actionName: string = '국고/연금 관리자 권한 승인'): Promise<{ success: boolean; expiresAt: number }> {
    if (!adminUserId) {
      throw new BadRequestException('adminUserId is required');
    }

    const code = randomInt(100000, 999999).toString();
    const now = Date.now();
    const expiresAt = now + this.TTL_MS;

    this.otpStore.set(adminUserId, {
      code,
      expiresAt,
      actionName,
      createdAt: now,
    });

    const title = '🔐 [월덕 머니버스] 관리자 승인 2FA OTP 코드 발송';
    const lines = [
      `• **요청 작업**: ${actionName}`,
      `• **인증 코드**: [ ${code} ]`,
      `• **유효 시간**: 5분 (300초 이내 입력)`,
      `• **관리자 ID**: ${adminUserId}`,
      `• **발송 시각**: ${new Date(now).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`,
    ];

    // 1. 텔레그램 관리자 채널 발송
    if (this.telegramAlertService) {
      try {
        await this.telegramAlertService.sendAlert({
          category: 'admin',
          severity: 'CRITICAL',
          title,
          lines,
        });
      } catch (err) {
        this.logger.warn(`Failed to dispatch OTP to Telegram: ${err}`);
      }
    }

    // 2. 디스코드 관리자 채널 발송
    if (this.discordAlertService) {
      try {
        await this.discordAlertService.sendAdminDirectMessage({
          title,
          description: lines.join('\n'),
          color: 0xef4444, // Red
        });
      } catch (err) {
        this.logger.warn(`Failed to dispatch OTP to Discord: ${err}`);
      }
    }

    this.logger.log(`Admin OTP generated and dispatched for ${adminUserId} (${actionName})`);
    return { success: true, expiresAt };
  }

  /**
   * 입력된 OTP 코드를 상호 대조하여 검증합니다.
   * 성공 시 1회용으로 즉시 소모(파기)됩니다.
   */
  verifyOtp(adminUserId: string, inputCode: string): boolean {
    if (!adminUserId || !inputCode) {
      return false;
    }

    const session = this.otpStore.get(adminUserId);
    if (!session) {
      this.logger.warn(`No active OTP session found for admin ${adminUserId}`);
      return false;
    }

    if (Date.now() > session.expiresAt) {
      this.otpStore.delete(adminUserId);
      this.logger.warn(`OTP expired for admin ${adminUserId}`);
      return false;
    }

    const expectedBuffer = Buffer.from(session.code, 'utf8');
    const inputBuffer = Buffer.from(inputCode.trim(), 'utf8');

    if (expectedBuffer.length !== inputBuffer.length) {
      return false;
    }

    const isMatch = timingSafeEqual(expectedBuffer, inputBuffer);
    if (isMatch) {
      // 1회용 즉시 소모
      this.otpStore.delete(adminUserId);
      this.logger.log(`Admin OTP successfully verified and consumed for ${adminUserId}`);
      return true;
    }

    return false;
  }
}
