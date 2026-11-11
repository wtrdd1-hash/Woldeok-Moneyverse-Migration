import { Injectable, Logger, BadRequestException, UnauthorizedException, Optional } from '@nestjs/common';
import { timingSafeEqual, randomInt } from 'node:crypto';
import { TelegramAlertService } from '../telegram/telegram-alert.service';
import { DiscordAlertService } from '../discord/discord-alert.service';

export interface OtpSession {
  readonly code: string;
  readonly expiresAt: number;
  readonly actionName: string;
  readonly createdAt: number;
}

export interface R2ElevationSession {
  readonly elevatedAt: number;
  readonly expiresAt: number;
}

@Injectable()
export class AdminChannelOtpService {
  private readonly logger = new Logger(AdminChannelOtpService.name);
  private readonly otpStore = new Map<string, OtpSession>();
  private readonly r2Elevations = new Map<string, R2ElevationSession>();
  private readonly TTL_MS = 5 * 60 * 1000; // 5분
  private readonly R2_TTL_MS = 15 * 60 * 1000; // 15분

  constructor(
    @Optional() private readonly telegramAlertService?: TelegramAlertService,
    @Optional() private readonly discordAlertService?: DiscordAlertService,
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

  /**
   * R2 민감 페이지 진입을 위한 15분 승격 세션을 활성화합니다.
   */
  elevateR2Session(adminUserId: string, inputCode: string): { success: boolean; expiresAt?: number } {
    const verified = this.verifyOtp(adminUserId, inputCode);
    if (!verified) {
      return { success: false };
    }
    const now = Date.now();
    const expiresAt = now + this.R2_TTL_MS;
    this.r2Elevations.set(adminUserId, {
      elevatedAt: now,
      expiresAt,
    });
    this.logger.log(`Admin R2 session elevated for 15 minutes: ${adminUserId}`);
    return { success: true, expiresAt };
  }

  /**
   * 현재 관리자의 R2 세션 승격 상태와 잔여 시간(초)을 확인합니다.
   */
  getR2ElevationStatus(adminUserId: string): { elevated: boolean; remainingSeconds: number; expiresAt: number } {
    if (!adminUserId) {
      return { elevated: false, remainingSeconds: 0, expiresAt: 0 };
    }
    const session = this.r2Elevations.get(adminUserId);
    if (!session) {
      return { elevated: false, remainingSeconds: 0, expiresAt: 0 };
    }
    const now = Date.now();
    if (now > session.expiresAt) {
      this.r2Elevations.delete(adminUserId);
      return { elevated: false, remainingSeconds: 0, expiresAt: 0 };
    }
    const remainingSeconds = Math.max(0, Math.floor((session.expiresAt - now) / 1000));
    return { elevated: true, remainingSeconds, expiresAt: session.expiresAt };
  }

  /**
   * R2 세션 승격을 즉시 취소하고 잠금(Lockout)합니다.
   */
  revokeR2Session(adminUserId: string): { success: boolean } {
    this.r2Elevations.delete(adminUserId);
    this.logger.log(`Admin R2 session revoked (locked): ${adminUserId}`);
    return { success: true };
  }

  /**
   * 관리자 메신저(텔레그램/디스코드)로 즉시 테스트 핑 알림을 발송합니다.
   */
  async sendTestPing(adminUserId: string, channel: 'all' | 'telegram' | 'discord' = 'all'): Promise<{ success: boolean; dispatchedTo: string[] }> {
    const dispatchedTo: string[] = [];
    const title = '📡 [월덕 머니버스] 관리자 2FA 채널 연동 테스트 핑';
    const now = Date.now();
    const lines = [
      '• **테스트 유형**: 2FA/OTP 메신저 알림 채널 실시간 무결성 점검',
      `• **관리자 ID**: ${adminUserId}`,
      `• **테스트 채널**: ${channel.toUpperCase()}`,
      `• **발송 시각**: ${new Date(now).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`,
      '• **결과**: 정상 수신됨 (경고 없음)',
    ];

    if ((channel === 'all' || channel === 'telegram') && this.telegramAlertService) {
      try {
        await this.telegramAlertService.sendAlert({
          category: 'admin',
          severity: 'INFO',
          title,
          lines,
        });
        dispatchedTo.push('telegram');
      } catch (err) {
        this.logger.warn(`Test ping to Telegram failed: ${err}`);
      }
    }

    if ((channel === 'all' || channel === 'discord') && this.discordAlertService) {
      try {
        await this.discordAlertService.sendAdminDirectMessage({
          title,
          description: lines.join('\n'),
          color: 0x3b82f6, // Blue
        });
        dispatchedTo.push('discord');
      } catch (err) {
        this.logger.warn(`Test ping to Discord failed: ${err}`);
      }
    }

    return { success: dispatchedTo.length > 0, dispatchedTo };
  }

}
