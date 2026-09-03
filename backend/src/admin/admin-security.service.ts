import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { sha256 } from '../auth/crypto';
import type { SecondFactorRepository } from '../auth/second-factor.repository';
import type { LoginPolicyRow } from '../auth/second-factor.repository';
import type {
  AdminSessionStatus,
  OpenedAdminSession,
  SessionRepository,
} from '../auth/session.repository';
import type { TotpSealingKey } from '../auth/totp';
import {
  base32Encode,
  generateSecret,
  openSecret,
  otpauthUri,
  sealSecret,
  verifyCode,
} from '../auth/totp';

export class SecondFactorUnavailableError extends Error {
  constructor() {
    super('the administrator second factor is not configured on this deployment');
    this.name = 'SecondFactorUnavailableError';
  }
}

export class SecondFactorRejectedError extends Error {
  readonly failedAttempts: number;
  readonly lockedUntil: Date | null;

  constructor(failedAttempts: number, lockedUntil: Date | null) {
    super('the authentication code is not valid');
    this.name = 'SecondFactorRejectedError';
    this.failedAttempts = failedAttempts;
    this.lockedUntil = lockedUntil;
  }
}

export class RecoveryCodeRejectedError extends Error {
  constructor() {
    super('the recovery code is not valid');
    this.name = 'RecoveryCodeRejectedError';
  }
}

export interface SecondFactorStatus {
  readonly enrolled: boolean;
  readonly confirmed: boolean;
  readonly lockedUntil: string | null;
}

/**
 * Everything that decides whether an administrator is who they say they are:
 * the TOTP factor, the console session that a proved factor opens, the device
 * and address policy, and the remote logout that ends somebody else's.
 *
 * The sealing key is held here and nowhere else in the process. Without it
 * this service refuses every second-factor route rather than falling back to
 * an unsealed secret — a deployment that forgot the key must be visibly
 * broken, not quietly weaker.
 */
@Injectable()
export class AdminSecurityService {
  private readonly factors: SecondFactorRepository;
  private readonly sessions: SessionRepository;
  private readonly sealing: TotpSealingKey | null;
  private readonly issuer: string;

  constructor({
    factors,
    sessions,
    sealing,
    issuer,
  }: {
    readonly factors: SecondFactorRepository;
    readonly sessions: SessionRepository;
    readonly sealing: TotpSealingKey | null;
    readonly issuer: string;
  }) {
    this.factors = factors;
    this.sessions = sessions;
    this.sealing = sealing;
    this.issuer = issuer;
  }

  private key(): TotpSealingKey {
    if (!this.sealing) throw new SecondFactorUnavailableError();
    return this.sealing;
  }

  get available(): boolean {
    return this.sealing !== null;
  }

  async status(userId: string): Promise<SecondFactorStatus> {
    const sealed = await this.factors.sealedSecret(userId);
    return {
      enrolled: sealed !== null,
      confirmed: sealed?.confirmed === true,
      lockedUntil: sealed?.locked_until?.toISOString() ?? null,
    };
  }

  /**
   * Starts enrolment and hands back the only clear-text copy of the secret
   * this application will ever produce. It is shown once, on the screen that
   * asked for it; the database receives the sealed form and nothing else.
   */
  async beginEnrolment(input: {
    readonly userId: string;
    readonly sessionId: string;
    readonly account: string;
  }): Promise<{ readonly otpauthUri: string; readonly secret: string }> {
    const sealing = this.key();
    const secret = generateSecret();
    const digits = 6;
    const periodSeconds = 30;
    await this.factors.beginEnrolment({
      userId: input.userId,
      sessionId: input.sessionId,
      sealedSecret: sealSecret(secret, sealing),
      keyId: sealing.keyId,
      digits,
      periodSeconds,
    });
    return {
      otpauthUri: otpauthUri({
        secret,
        issuer: this.issuer,
        account: input.account,
        digits,
        periodSeconds,
      }),
      secret: base32Encode(secret),
    };
  }

  async confirmEnrolment(input: {
    readonly userId: string;
    readonly sessionId: string;
    readonly code: string;
  }): Promise<boolean> {
    const step = await this.stepFor(input.userId, input.code, { requireConfirmed: false });
    return this.factors.confirmEnrolment({
      userId: input.userId,
      sessionId: input.sessionId,
      step,
    });
  }

  /**
   * Spends a code. The step it belongs to goes to the database, which refuses
   * one it has already seen — so a code read over somebody's shoulder is
   * worth nothing the moment its owner has used it.
   */
  async verify(input: {
    readonly userId: string;
    readonly code: string;
    readonly deviceHash?: string;
    readonly deviceLabel?: string;
  }): Promise<{ readonly verifiedAt: string | null }> {
    const step = await this.stepFor(input.userId, input.code, { requireConfirmed: true });
    const verifiedAt = await this.factors.consume(input.userId, step);
    if (input.deviceHash) {
      await this.factors.trustDevice({
        userId: input.userId,
        deviceHash: input.deviceHash,
        label: input.deviceLabel ?? '',
      });
    }
    return { verifiedAt: verifiedAt?.toISOString() ?? null };
  }

  /**
   * A wrong code is counted before it is refused. Five in a row lock the
   * credential for fifteen minutes, which is what makes six digits enough:
   * guessing is a rate problem, not an entropy problem.
   */
  private async stepFor(
    userId: string,
    code: string,
    { requireConfirmed }: { readonly requireConfirmed: boolean },
  ): Promise<number> {
    const sealing = this.key();
    const sealed = await this.factors.sealedSecret(userId);
    if (!sealed || (requireConfirmed && !sealed.confirmed)) {
      throw new SecondFactorRejectedError(0, null);
    }
    if (sealed.key_id !== sealing.keyId) {
      // The row was sealed with a key this process does not hold. Enrolling
      // again is the only way forward, and saying so beats a decryption error.
      throw new SecondFactorUnavailableError();
    }
    const step = verifyCode(openSecret(sealed.secret_ciphertext, sealing), code, {
      digits: sealed.digits,
      periodSeconds: sealed.period_seconds,
    });
    if (step === null) {
      const { failedAttempts, lockedUntil } = await this.factors.recordFailure(userId);
      throw new SecondFactorRejectedError(failedAttempts, lockedUntil);
    }
    return step;
  }

  evaluateLoginContext(input: {
    readonly userId: string;
    readonly ipAddress: string | null;
    readonly deviceHash: string | null;
  }) {
    return this.factors.evaluateLoginContext(input);
  }

  loginPolicy(actorUserId: string, targetUserId: string): Promise<LoginPolicyRow[]> {
    return this.factors.loginPolicy(actorUserId, targetUserId);
  }

  setIpAllowlist(input: {
    readonly idempotencyKey: string;
    readonly actorUserId: string;
    readonly targetUserId: string;
    readonly networks: readonly string[];
    readonly reason: string;
  }): Promise<{ readonly entries: number }> {
    return this.factors.setIpAllowlist(input);
  }

  /**
   * The console session's state, as a side effect of the operator loading an
   * administrator page -- which is the activity the idle clock is supposed to
   * measure, so reading it here is the measurement rather than a distortion
   * of it. `admin_session_touch` moves the clock only for a session that is
   * already open, so a closed or locked one is reported without being
   * silently revived.
   */
  consoleSession(sessionId: string, userId: string): Promise<AdminSessionStatus> {
    return this.sessions.touchAdminSession(sessionId, userId);
  }

  openConsoleSession(sessionId: string, userId: string): Promise<OpenedAdminSession> {
    return this.sessions.openAdminSession(sessionId, userId);
  }

  closeConsoleSession(sessionId: string, userId: string): Promise<boolean> {
    return this.sessions.closeAdminSession(sessionId, userId);
  }

  async issueRecoveryCodes(userId: string, sessionId: string) {
    const codes = Array.from({ length: 8 }, () => randomBytes(20).toString('base64url'));
    const issued = await this.factors.issueRecoveryCodes(userId, sessionId, codes.map(sha256));
    return { codes, expiresAt: issued.expiresAt.toISOString() };
  }

  async openConsoleWithRecoveryCode(sessionId: string, userId: string, code: string) {
    const opened = await this.sessions.openAdminSessionWithRecoveryCode(
      sessionId,
      userId,
      sha256(code),
    );
    if (!opened) throw new RecoveryCodeRejectedError();
    return opened;
  }

  forceLogout(input: {
    readonly idempotencyKey: string;
    readonly actorUserId: string;
    readonly targetUserId: string;
    readonly reason: string;
  }): Promise<{ readonly revokedSessions: number }> {
    return this.sessions.forceLogout(input);
  }
}
