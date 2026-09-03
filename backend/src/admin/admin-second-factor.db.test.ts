import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from '../testing/database';

/**
 * Migration 059, executed. Skips without DATABASE_URL; CI is where it runs.
 *
 * The property worth proving here is the one §10 asks for: reading the
 * database is not enough to produce a code. So the credential table must stay
 * unreadable by the application role, and the functions that guard the state
 * machine around a code — is the credential confirmed, is the step plausibly
 * now, has it been spent — must refuse in their own vocabulary rather than
 * letting a caller assert its way past them.
 */
const DATABASE_URL = databaseUrl();
const UNKNOWN = '00000000-0000-4000-8000-000000000000';
const SEALED = 'a'.repeat(64);

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL)('the administrator second factor against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('keeps every second-factor table unreadable by the application role', async () => {
    for (const table of [
      'admin_totp_credentials',
      'admin_trusted_devices',
      'admin_ip_allowlist',
      'admin_login_attempts',
      'admin_recovery_codes',
      'admin_recovery_code_state',
    ]) {
      await expect(pool.query(`SELECT * FROM public.${table}`)).rejects.toThrow(
        /permission denied/i,
      );
    }
  });

  it('refuses to issue recovery codes without the superadmin designation', async () => {
    const error = await rejectionOf(() =>
      pool.query('SELECT * FROM public.admin_recovery_codes_issue($1,$2,$3::text[])', [
        UNKNOWN,
        UNKNOWN,
        Array.from({ length: 8 }, (_, index) => String(index).padStart(64, 'a')),
      ]),
    );
    expect(code(error)).toBe('42501');
  });

  it('refuses recovery before code comparison without recent OAuth reauthentication', async () => {
    const error = await rejectionOf(() =>
      pool.query('SELECT * FROM public.admin_recovery_code_open_session($1,$2,$3,$4,$5)', [
        UNKNOWN,
        UNKNOWN,
        'a'.repeat(64),
        'b'.repeat(64),
        'c'.repeat(64),
      ]),
    );
    expect(code(error)).toBe('42501');
  });

  it('answers nothing for an account with no credential rather than raising', async () => {
    const { rows } = await pool.query('SELECT * FROM public.admin_totp_sealed_secret($1)', [
      UNKNOWN,
    ]);
    expect(rows).toHaveLength(0);
  });

  it('refuses to spend a code when no confirmed credential is enrolled', async () => {
    const error = await rejectionOf(() =>
      pool.query('SELECT * FROM public.admin_totp_consume($1,$2)', [UNKNOWN, 1]),
    );
    expect(code(error)).toBe('55000');
  });

  it('refuses to enrol without an administrator role', async () => {
    const error = await rejectionOf(() =>
      pool.query('SELECT * FROM public.admin_totp_begin_enrolment($1,$2,$3,$4)', [
        UNKNOWN,
        UNKNOWN,
        SEALED,
        'default',
      ]),
    );
    expect(code(error)).toBe('42501');
  });

  it('refuses to confirm an enrolment that was never started', async () => {
    const error = await rejectionOf(() =>
      pool.query('SELECT public.admin_totp_confirm_enrolment($1,$2,$3::bigint)', [
        UNKNOWN,
        UNKNOWN,
        1,
      ]),
    );
    // The reauthentication check comes first for an unknown session, and the
    // missing enrolment second; either refusal means the door is shut.
    expect(['42501', '22023']).toContain(code(error));
  });

  it('counts a failure for an account with no credential without inventing one', async () => {
    const { rows } = await pool.query<{ failed_attempts: number }>(
      'SELECT failed_attempts FROM public.admin_totp_record_failure($1)',
      [UNKNOWN],
    );
    expect(rows[0]?.failed_attempts).toBe(0);
  });

  it('says an account with no credential has not satisfied the factor', async () => {
    const { rows } = await pool.query<{ satisfied: boolean }>(
      'SELECT public.admin_second_factor_satisfied($1, 300) AS satisfied',
      [UNKNOWN],
    );
    expect(rows[0]?.satisfied).toBe(false);
  });

  it('challenges a sign-in from an unrecognised device when no allowlist exists', async () => {
    const { rows } = await pool.query<{ decision: string; reason: string }>(
      'SELECT decision, reason FROM public.admin_evaluate_login_context($1,$2::inet,$3)',
      [UNKNOWN, '203.0.113.9', 'f'.repeat(64)],
    );
    expect(rows[0]?.decision).toBe('challenge');
    expect(rows[0]?.reason).toBe('unrecognised device');
  });

  it('refuses to trust a device without a recent code', async () => {
    const error = await rejectionOf(() =>
      pool.query('SELECT public.admin_trust_device($1,$2,$3)', [UNKNOWN, 'f'.repeat(64), '']),
    );
    expect(code(error)).toBe('42501');
  });

  it('refuses an allowlist change from somebody who is not the superadmin', async () => {
    const error = await rejectionOf(() =>
      pool.query('SELECT * FROM public.admin_set_ip_allowlist($1,$2,$3,$4::text[],$5)', [
        randomUUID(),
        UNKNOWN,
        UNKNOWN,
        ['203.0.113.0/24'],
        'restricting administrator sign-in to the office network',
      ]),
    );
    expect(code(error)).toBe('42501');
  });

  it('refuses to read somebody else\'s login policy without the designation', async () => {
    const error = await rejectionOf(() =>
      pool.query('SELECT * FROM public.admin_login_policy($1,$2)', [UNKNOWN, randomUUID()]),
    );
    expect(code(error)).toBe('42501');
  });
});
