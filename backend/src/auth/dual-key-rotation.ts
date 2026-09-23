import { Injectable, Optional } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 604,800,000 ms (7 days)

export interface DualKeyRotationOptions {
  readonly currentKey?: string;
  readonly previousKey?: string | null;
  readonly rotationTimestamp?: number;
  readonly gracePeriodMs?: number;
}

export interface DualKeyVerifyResult {
  readonly valid: boolean;
  readonly payload: string | null;
  readonly keyType: 'current' | 'previous' | 'invalid';
  readonly needsReissue: boolean;
  readonly reason?: string;
  readonly issuedAt?: number;
}

export interface DualKeyRotateResult {
  readonly rotated: boolean;
  readonly token: string;
  readonly reason?: string;
}

function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * G406-07 Dual-Key Overlap Rotation Service (OWASP ASVS 5.0 & NIST SP 800-63B-4).
 *
 * Ensures zero-downtime session continuity during key rotation by simultaneously
 * accepting both CURRENT_KEY and PREVIOUS_KEY during a 7-day grace period.
 * When a session signed with PREVIOUS_KEY is encountered within the grace period,
 * it is verified as valid and marked with `needsReissue: true` so the caller can
 * transparently migrate the active user to a new CURRENT_KEY token.
 */
@Injectable()
export class DualKeyRotationService {
  private readonly currentKey: string;
  private readonly previousKey: string | null;
  private readonly rotationTimestamp: number;
  private readonly gracePeriodMs: number;

  constructor(@Optional() options?: DualKeyRotationOptions) {
    this.currentKey =
      options?.currentKey ??
      process.env.SESSION_CURRENT_KEY ??
      process.env.SESSION_SIGNING_KEY ??
      process.env.DATA_ENCRYPTION_KEY ??
      'moneyverse-default-session-signing-current-key-2026';

    this.previousKey =
      options?.previousKey !== undefined
        ? options.previousKey
        : (process.env.SESSION_PREVIOUS_KEY ?? process.env.LEGACY_SESSION_SIGNING_KEY ?? null);

    this.rotationTimestamp =
      options?.rotationTimestamp ??
      (process.env.SESSION_KEY_ROTATED_AT ? Number(process.env.SESSION_KEY_ROTATED_AT) : Date.now());

    this.gracePeriodMs =
      options?.gracePeriodMs ??
      (process.env.SESSION_GRACE_PERIOD_MS ? Number(process.env.SESSION_GRACE_PERIOD_MS) : SEVEN_DAYS_MS);
  }

  getCurrentKey(): string {
    return this.currentKey;
  }

  getPreviousKey(): string | null {
    return this.previousKey;
  }

  getRotationTimestamp(): number {
    return this.rotationTimestamp;
  }

  getGracePeriodMs(): number {
    return this.gracePeriodMs;
  }

  /**
   * Signs a session payload using the specified key (defaulting to currentKey).
   * Format: mv_s.<payload>.<issuedAt>.<base64url_hmac_sha256>
   */
  signToken(payload: string, key?: string, issuedAt?: number): string {
    if (!payload || typeof payload !== 'string') {
      throw new Error('payload must be a non-empty string');
    }
    const ts = issuedAt ?? Date.now();
    const signingKey = key ?? this.currentKey;
    const message = `${payload}:${ts}`;
    const signature = createHmac('sha256', signingKey).update(message).digest('base64url');
    return `mv_s.${payload}.${ts}.${signature}`;
  }

  /**
   * Verifies a signed session token against CURRENT_KEY, and if unverified,
   * falls back to PREVIOUS_KEY provided the 7-day grace period has not elapsed.
   */
  verifyToken(token: string, options?: { now?: number }): DualKeyVerifyResult {
    if (!token || typeof token !== 'string') {
      return { valid: false, payload: null, keyType: 'invalid', needsReissue: false, reason: 'Token is empty or invalid type' };
    }

    const parts = token.split('.');
    if (parts.length !== 4 || parts[0] !== 'mv_s') {
      return { valid: false, payload: null, keyType: 'invalid', needsReissue: false, reason: 'Malformed token format' };
    }

    const [, payload, tsStr, signature] = parts;
    const issuedAt = Number(tsStr);
    if (!payload || isNaN(issuedAt) || !signature) {
      return { valid: false, payload: null, keyType: 'invalid', needsReissue: false, reason: 'Invalid token structure or timestamp' };
    }

    const message = `${payload}:${issuedAt}`;

    // 1. Try CURRENT_KEY
    const expectedCurrentSig = createHmac('sha256', this.currentKey).update(message).digest('base64url');
    if (safeCompare(signature, expectedCurrentSig)) {
      return {
        valid: true,
        payload,
        keyType: 'current',
        needsReissue: false,
        issuedAt,
      };
    }

    // 2. Try PREVIOUS_KEY with 7-day Grace Period
    if (this.previousKey) {
      const expectedPrevSig = createHmac('sha256', this.previousKey).update(message).digest('base64url');
      if (safeCompare(signature, expectedPrevSig)) {
        const currentTime = options?.now ?? Date.now();
        const graceDeadline = this.rotationTimestamp + this.gracePeriodMs;

        if (currentTime <= graceDeadline) {
          return {
            valid: true,
            payload,
            keyType: 'previous',
            needsReissue: true,
            issuedAt,
          };
        } else {
          return {
            valid: false,
            payload,
            keyType: 'previous',
            needsReissue: false,
            reason: `Grace period expired on ${new Date(graceDeadline).toISOString()} (7-day window passed)`,
            issuedAt,
          };
        }
      }
    }

    return {
      valid: false,
      payload: null,
      keyType: 'invalid',
      needsReissue: false,
      reason: 'Signature mismatch on both current and previous keys',
    };
  }

  /**
   * Transparently re-signs a valid token signed with PREVIOUS_KEY using CURRENT_KEY.
   * If the token was already signed with CURRENT_KEY, it is returned as-is.
   */
  rotateToken(token: string, options?: { now?: number }): DualKeyRotateResult {
    const verification = this.verifyToken(token, options);
    if (!verification.valid || !verification.payload) {
      return {
        rotated: false,
        token,
        reason: verification.reason ?? 'Cannot rotate invalid token',
      };
    }

    if (verification.needsReissue) {
      const newToken = this.signToken(verification.payload, this.currentKey, options?.now);
      return {
        rotated: true,
        token: newToken,
      };
    }

    return {
      rotated: false,
      token,
    };
  }
}
