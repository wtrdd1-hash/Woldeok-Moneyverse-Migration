import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import type { TelegramAlertService } from '../telegram/telegram-alert.service';
import type { DiscordAlertService } from '../discord/discord-alert.service';

export type AdminOtpIntent =
  | {
      readonly action: 'treasury_mint_topup';
      readonly amountWld: string;
      readonly reason: string;
      readonly requestKey: string;
    }
  | {
      readonly action: 'treasury_salary_disburse';
      readonly amountWld: string;
      readonly reason: string;
      readonly targetAdminId: string;
    };

interface OtpSession {
  readonly digest: Buffer;
  readonly salt: Buffer;
  readonly binding: string;
  readonly expiresAt: number;
  failures: number;
}

const TTL_MS = 5 * 60_000;
const REQUEST_INTERVAL_MS = 60_000;
const MAX_FAILURES = 5;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Canonical request binding: unknown keys and untrusted action names are never accepted. */
export function parseAdminOtpIntent(value: unknown): AdminOtpIntent {
  if (!record(value)) throw new BadRequestException('invalid OTP intent');

  const { action, amountWld, reason } = value;
  if (action !== 'treasury_mint_topup' && action !== 'treasury_salary_disburse') {
    throw new BadRequestException('unsupported administrator OTP action');
  }

  const allowed = action === 'treasury_mint_topup'
    ? ['action', 'amountWld', 'reason', 'requestKey']
    : ['action', 'amountWld', 'reason', 'targetAdminId'];
  if (Object.keys(value).length !== allowed.length || Object.keys(value).some((key) => !allowed.includes(key))) {
    throw new BadRequestException('unexpected OTP intent fields');
  }
  if (typeof amountWld !== 'string' || !/^[1-9][0-9]{0,7}$/.test(amountWld)) {
    throw new BadRequestException('invalid OTP amount');
  }
  const limit = action === 'treasury_mint_topup' ? 10_000_000 : 5_000_000;
  if (Number(amountWld) > limit) throw new BadRequestException('OTP amount exceeds operation limit');
  if (typeof reason !== 'string' || reason.trim().length < 5 || reason.trim().length > 2000) {
    throw new BadRequestException('invalid OTP reason');
  }
  const normalizedReason = reason.trim();

  if (action === 'treasury_mint_topup') {
    if (typeof value.requestKey !== 'string' || !UUID.test(value.requestKey)) {
      throw new BadRequestException('invalid mint request key');
    }
    return { action, amountWld, reason: normalizedReason, requestKey: value.requestKey.toLowerCase() };
  }
  if (typeof value.targetAdminId !== 'string' || !UUID.test(value.targetAdminId)) {
    throw new BadRequestException('invalid salary recipient');
  }
  return { action, amountWld, reason: normalizedReason, targetAdminId: value.targetAdminId.toLowerCase() };
}

function binding(intent: AdminOtpIntent): string {
  return createHash('sha256').update(JSON.stringify(intent)).digest('hex');
}

function otpHash(code: string, salt: Buffer): Buffer {
  return createHash('sha256').update(salt).update(code).digest();
}

function key(adminUserId: string, sessionId: string, action: string): string {
  if (!adminUserId || !sessionId) throw new BadRequestException('administrator session required');
  return `${adminUserId}:${sessionId}:${action}`;
}

/**
 * Single-instance step-up store. All OTPs fail closed across restarts; shared storage
 * and distributed rate limiting are mandatory before running more than one backend.
 */
@Injectable()
export class AdminChannelOtpService {
  private readonly logger = new Logger(AdminChannelOtpService.name);
  private readonly pending = new Set<string>();
  private readonly lastIssuedAt = new Map<string, number>();
  private readonly otpStore = new Map<string, OtpSession>();

  constructor(
    private readonly telegramAlertService?: TelegramAlertService,
    private readonly discordAlertService?: DiscordAlertService,
  ) {}

  async requestOtp(
    adminUserId: string,
    adminSessionId: string,
    rawIntent: unknown,
  ): Promise<{ success: true; expiresAt: number }> {
    const intent = parseAdminOtpIntent(rawIntent);
    const scope = key(adminUserId, adminSessionId, intent.action);
    const now = Date.now();

    if (this.pending.has(scope) || now - (this.lastIssuedAt.get(scope) ?? -Infinity) < REQUEST_INTERVAL_MS) {
      throw new HttpException('OTP request rate limited', HttpStatus.TOO_MANY_REQUESTS);
    }
    if (!this.telegramAlertService || !this.discordAlertService) {
      throw new ServiceUnavailableException('administrator OTP delivery unavailable');
    }

    this.pending.add(scope);
    this.lastIssuedAt.set(scope, now);
    // Invalidate previous OTP before attempting a new dispatch.
    this.otpStore.delete(scope);
    try {
      const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
      const salt = randomBytes(16);
      const summary = intent.action === 'treasury_mint_topup'
        ? 'Treasury mint top-up'
        : 'Administrator salary disbursement';
      const lines = [
        `Action: ${summary}`,
        `Amount: ${intent.amountWld} WLD`,
        `One-time code: [ ${code} ]`,
        'Expires in 5 minutes; never forward this code.',
      ];
      const [telegramSent, discordSent] = await Promise.allSettled([
        this.telegramAlertService.sendAlert({
          category: 'admin',
          severity: 'CRITICAL',
          title: 'Moneyverse administrator OTP approval',
          lines,
        }),
        this.discordAlertService.sendAdminDirectMessage({
          title: 'Moneyverse administrator OTP approval',
          description: lines.join('\\n'),
          color: 0xef4444,
        }),
      ]);

      if (
        telegramSent.status !== 'fulfilled' || telegramSent.value !== true ||
        discordSent.status !== 'fulfilled' || discordSent.value?.success !== true
      ) {
        this.logger.warn('Administrator OTP dispatch failed; approval is blocked');
        throw new ServiceUnavailableException('administrator OTP delivery failed');
      }

      const expiresAt = Date.now() + TTL_MS;
      this.otpStore.set(scope, {
        digest: otpHash(code, salt),
        salt,
        binding: binding(intent),
        expiresAt,
        failures: 0,
      });

      // Garbage collect expired scopes; no unbounded OTP / rate-limiter growth.
      if (this.lastIssuedAt.size > 250) {
        for (const [issuedScope, timestamp] of this.lastIssuedAt) {
          if (timestamp < now - TTL_MS) this.lastIssuedAt.delete(issuedScope);
        }
        for (const [activeScope, session] of this.otpStore) {
          if (session.expiresAt < now) this.otpStore.delete(activeScope);
        }
      }

      return { success: true, expiresAt };
    } finally {
      this.pending.delete(scope);
    }
  }

  /** Returns false and never calls business operations when the bound code is invalid. */
  verifyOtp(
    adminUserId: string,
    adminSessionId: string,
    rawIntent: unknown,
    inputCode: unknown,
  ): boolean {
    let intent: AdminOtpIntent;
    try {
      intent = parseAdminOtpIntent(rawIntent);
    } catch {
      return false;
    }
    if (typeof inputCode !== 'string' || !/^\d{6}$/.test(inputCode)) return false;
    let scope: string;
    try {
      scope = key(adminUserId, adminSessionId, intent.action);
    } catch {
      return false;
    }
    const session = this.otpStore.get(scope);
    if (!session) return false;
    if (Date.now() >= session.expiresAt) {
      this.otpStore.delete(scope);
      return false;
    }

    session.failures += 1;
    const expectedBinding = Buffer.from(session.binding, 'hex');
    const receivedBinding = Buffer.from(binding(intent), 'hex');
    const validBinding = timingSafeEqual(expectedBinding, receivedBinding);
    const validCode = timingSafeEqual(session.digest, otpHash(inputCode, session.salt));
    if (validBinding && validCode) {
      this.otpStore.delete(scope);
      return true;
    }
    if (session.failures >= MAX_FAILURES) this.otpStore.delete(scope);
    return false;
  }
}
