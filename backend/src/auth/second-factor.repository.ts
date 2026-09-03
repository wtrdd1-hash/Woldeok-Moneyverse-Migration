import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

/**
 * The administrator second factor, and the device and address policy around
 * an administrator sign-in.
 *
 * Every method here is a call into a function from
 * packages/database/migrations/058-admin-second-factor.sql. The application
 * decides whether a code matches, because it is the only place the sealing
 * key exists; the database decides everything else, and refuses a step it has
 * already seen or a credential it has locked.
 */

export class SecondFactorInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecondFactorInputError';
  }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DEVICE_HASH_PATTERN = /^[0-9a-f]{64}$/;

/**
 * An IPv4 or IPv6 network in CIDR form. Checked here as well as by the `cidr`
 * cast in SQL because a bad cast raises 22P02, which `pg-error.ts` does not
 * recognise and would surface as a 500 rather than as "check that address".
 */
const CIDR_PATTERN = /^[0-9a-fA-F:.]{2,45}\/(?:[0-9]|[1-9][0-9]|1[01][0-9]|12[0-8])$/;

function assertUuid(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new SecondFactorInputError(`${field} must be a UUID`);
  }
}

// packages/database/migrations/058-admin-second-factor.sql (admin_totp_sealed_secret)
export interface SealedSecretRow {
  readonly secret_ciphertext: string;
  readonly key_id: string;
  readonly digits: number;
  readonly period_seconds: number;
  readonly confirmed: boolean;
  readonly locked_until: Date | null;
}

// packages/database/migrations/058-admin-second-factor.sql (admin_evaluate_login_context)
export interface LoginContextRow {
  readonly decision: 'allow' | 'challenge' | 'block';
  readonly reason: string;
}

// packages/database/migrations/058-admin-second-factor.sql (admin_login_policy)
export interface LoginPolicyRow {
  readonly kind: string;
  readonly value: string;
  readonly label: string;
  readonly recorded_at: Date;
}

@Injectable()
export class SecondFactorRepository {
  readonly pool: Queryable;

  constructor(pool: Queryable) {
    this.pool = pool;
  }

  async sealedSecret(userId: unknown): Promise<SealedSecretRow | null> {
    assertUuid(userId, 'user id');
    return queryOne<SealedSecretRow>(
      this.pool,
      `SELECT secret_ciphertext, key_id, digits, period_seconds, confirmed, locked_until
       FROM public.admin_totp_sealed_secret($1)`,
      [userId],
    );
  }

  async beginEnrolment(input: {
    readonly userId: unknown;
    readonly sessionId: unknown;
    readonly sealedSecret: string;
    readonly keyId: string;
    readonly digits: number;
    readonly periodSeconds: number;
  }): Promise<{ readonly replacedConfirmedCredential: boolean }> {
    assertUuid(input.userId, 'user id');
    assertUuid(input.sessionId, 'session id');
    const row = await queryOne<{ readonly replaced_confirmed_credential: boolean }>(
      this.pool,
      `SELECT replaced_confirmed_credential
       FROM public.admin_totp_begin_enrolment($1, $2, $3, $4, $5::smallint, $6)`,
      [
        input.userId,
        input.sessionId,
        input.sealedSecret,
        input.keyId,
        input.digits,
        input.periodSeconds,
      ],
    );
    return { replacedConfirmedCredential: row?.replaced_confirmed_credential === true };
  }

  async confirmEnrolment(input: {
    readonly userId: unknown;
    readonly sessionId: unknown;
    readonly step: number;
  }): Promise<boolean> {
    assertUuid(input.userId, 'user id');
    assertUuid(input.sessionId, 'session id');
    const row = await queryOne<{ readonly confirmed: boolean }>(
      this.pool,
      'SELECT public.admin_totp_confirm_enrolment($1, $2, $3::bigint) AS confirmed',
      [input.userId, input.sessionId, input.step],
    );
    return row?.confirmed === true;
  }

  async consume(userId: unknown, step: number): Promise<Date | null> {
    assertUuid(userId, 'user id');
    const row = await queryOne<{ readonly verified_at: Date }>(
      this.pool,
      'SELECT verified_at FROM public.admin_totp_consume($1, $2::bigint)',
      [userId, step],
    );
    return row?.verified_at ?? null;
  }

  async recordFailure(
    userId: unknown,
  ): Promise<{ readonly failedAttempts: number; readonly lockedUntil: Date | null }> {
    assertUuid(userId, 'user id');
    const row = await queryOne<{
      readonly failed_attempts: number;
      readonly locked_until: Date | null;
    }>(
      this.pool,
      'SELECT failed_attempts, locked_until FROM public.admin_totp_record_failure($1)',
      [userId],
    );
    return { failedAttempts: row?.failed_attempts ?? 0, lockedUntil: row?.locked_until ?? null };
  }

  async satisfiedRecently(userId: unknown, maxAgeSeconds: number): Promise<boolean> {
    assertUuid(userId, 'user id');
    const row = await queryOne<{ readonly satisfied: boolean }>(
      this.pool,
      'SELECT public.admin_second_factor_satisfied($1, $2) AS satisfied',
      [userId, maxAgeSeconds],
    );
    return row?.satisfied === true;
  }

  async issueRecoveryCodes(userId: unknown, sessionId: unknown, codeHashes: readonly string[]) {
    assertUuid(userId, 'user id');
    assertUuid(sessionId, 'session id');
    const row = await queryOne<{ readonly code_count: number; readonly expires_at: Date }>(
      this.pool,
      'SELECT code_count, expires_at FROM public.admin_recovery_codes_issue($1,$2,$3::text[])',
      [userId, sessionId, [...codeHashes]],
    );
    if (!row) throw new Error('admin_recovery_codes_issue did not return a row');
    return { count: row.code_count, expiresAt: row.expires_at };
  }

  async evaluateLoginContext(input: {
    readonly userId: unknown;
    readonly ipAddress: string | null;
    readonly deviceHash: string | null;
  }): Promise<LoginContextRow> {
    assertUuid(input.userId, 'user id');
    const row = await queryOne<LoginContextRow>(
      this.pool,
      'SELECT decision, reason FROM public.admin_evaluate_login_context($1, $2::inet, $3)',
      [input.userId, input.ipAddress, input.deviceHash],
    );
    // Invariant: admin_evaluate_login_context always returns exactly one row.
    if (!row) throw new Error('admin_evaluate_login_context did not return a row');
    return row;
  }

  async trustDevice(input: {
    readonly userId: unknown;
    readonly deviceHash: string;
    readonly label: string;
  }): Promise<boolean> {
    assertUuid(input.userId, 'user id');
    if (!DEVICE_HASH_PATTERN.test(input.deviceHash)) {
      throw new SecondFactorInputError('device hash must be 64 hexadecimal characters');
    }
    const row = await queryOne<{ readonly trusted: boolean }>(
      this.pool,
      'SELECT public.admin_trust_device($1, $2, $3) AS trusted',
      [input.userId, input.deviceHash, input.label.slice(0, 100)],
    );
    return row?.trusted === true;
  }

  async setIpAllowlist(input: {
    readonly idempotencyKey: unknown;
    readonly actorUserId: unknown;
    readonly targetUserId: unknown;
    readonly networks: readonly string[];
    readonly reason: string;
  }): Promise<{ readonly entries: number }> {
    assertUuid(input.idempotencyKey, 'idempotency key');
    assertUuid(input.actorUserId, 'actor user id');
    assertUuid(input.targetUserId, 'target user id');
    if (input.networks.length > 50) {
      throw new SecondFactorInputError('at most 50 networks are allowed');
    }
    for (const network of input.networks) {
      if (!CIDR_PATTERN.test(network)) {
        throw new SecondFactorInputError(`${network} is not a network in CIDR form`);
      }
    }
    const row = await queryOne<{ readonly entries: number }>(
      this.pool,
      'SELECT entries FROM public.admin_set_ip_allowlist($1, $2, $3, $4::text[], $5)',
      [
        input.idempotencyKey,
        input.actorUserId,
        input.targetUserId,
        [...input.networks],
        input.reason,
      ],
    );
    return { entries: row?.entries ?? 0 };
  }

  async loginPolicy(actorUserId: unknown, targetUserId: unknown): Promise<LoginPolicyRow[]> {
    assertUuid(actorUserId, 'actor user id');
    assertUuid(targetUserId, 'target user id');
    return queryRows<LoginPolicyRow>(
      this.pool,
      'SELECT kind, value, label, recorded_at FROM public.admin_login_policy($1, $2)',
      [actorUserId, targetUserId],
    );
  }
}
