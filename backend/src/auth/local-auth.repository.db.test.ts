import crypto from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl } from '../testing/database';
import { sha256, randomToken } from './crypto';
import { hashPassword } from './password-hasher';
import { LocalAuthRepository } from './local-auth.repository';
import { SessionRepository } from './session.repository';
import { PostgresWalletRepository } from '../wallet/wallet.repository';
import { WalletService } from '../wallet/wallet.service';

const DATABASE_URL = databaseUrl();

describe.skipIf(!DATABASE_URL)('LocalAuthRepository against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('completes verified local registration without an ambiguous conflict target', async () => {
    const sessions = new SessionRepository(pool);
    const local = new LocalAuthRepository(pool);
    const prelogin = await sessions.create();
    const policy = await sessions.currentConsentVersion();
    expect(policy).not.toBeNull();

    await sessions.grantPreloginConsent(prelogin.id, {
      termsCompleted: true,
      privacyCompleted: true,
      ageConfirmed: true,
      termsVersion: policy!.terms_version,
      privacyVersion: policy!.privacy_version,
    });

    const email = `qa-local-${crypto.randomUUID()}@example.test`;
    const emailHash = sha256(email);
    const verificationToken = randomToken();
    const accepted = await local.startRegistration({
      preAuthSessionId: prelogin.id,
      email,
      emailHash,
      passwordVerifier: await hashPassword('review-test-password-2026!'),
      displayName: 'Local Auth QA',
      verificationTokenHash: sha256(verificationToken),
    });
    expect(accepted).toBe(true);

    const completed = await local.completeRegistration(verificationToken);
    expect(completed.user_id).toMatch(/^[0-9a-f-]{36}$/);
    await expect(local.completeRegistration(verificationToken)).rejects.toThrow();
    expect(completed.is_new).toBe(true);
    expect(await sessions.hasCurrentUserConsent(completed.session_id)).toBe(true);
    expect((await local.credential(emailHash))?.user_id).toBe(completed.user_id);

    const wallet = new WalletService(new PostgresWalletRepository(pool));
    const overview = await wallet.overview(completed.user_id);
    expect(overview.userId).toBe(completed.user_id);
    expect(overview.balances.currency).toBe('WLD');
    expect(typeof overview.balances.cash.availableAmount).toBe('string');
    expect(typeof overview.balances.bank.availableAmount).toBe('string');
    expect(typeof overview.balances.totalAvailableAmount).toBe('string');
    expect(Array.isArray(overview.recentTransactions)).toBe(true);
  });

  it('exchanges a mobile OAuth handoff once and creates a separate app session', async () => {
    const sessions = new SessionRepository(pool);
    const local = new LocalAuthRepository(pool);
    const prelogin = await sessions.create();
    const policy = await sessions.currentConsentVersion();
    expect(policy).not.toBeNull();
    await sessions.grantPreloginConsent(prelogin.id, {
      termsCompleted: true, privacyCompleted: true, ageConfirmed: true,
      termsVersion: policy!.terms_version, privacyVersion: policy!.privacy_version,
    });

    const email = `qa-mobile-${crypto.randomUUID()}@example.test`;
    const verificationToken = randomToken();
    await local.startRegistration({
      preAuthSessionId: prelogin.id, email, emailHash: sha256(email),
      passwordVerifier: await hashPassword('review-test-password-2026!'),
      displayName: 'Mobile OAuth QA', verificationTokenHash: sha256(verificationToken),
    });
    const member = await local.completeRegistration(verificationToken);
    const handoff = await sessions.createMobileOAuthHandoff(member.user_id);
    const mobile = await sessions.consumeMobileOAuthHandoff(handoff);
    expect(mobile?.user_id).toBe(member.user_id);
    expect(mobile?.session_id).not.toBe(member.session_id);
    expect(await sessions.consumeMobileOAuthHandoff(handoff)).toBeNull();
  });

  it('resets a local password once and revokes active sessions', async () => {
    const sessions = new SessionRepository(pool);
    const local = new LocalAuthRepository(pool);
    const prelogin = await sessions.create();
    const policy = await sessions.currentConsentVersion();
    expect(policy).not.toBeNull();
    await sessions.grantPreloginConsent(prelogin.id, {
      termsCompleted: true, privacyCompleted: true, ageConfirmed: true,
      termsVersion: policy!.terms_version, privacyVersion: policy!.privacy_version,
    });
    const email = `qa-reset-${crypto.randomUUID()}@example.test`;
    const verificationToken = randomToken();
    await local.startRegistration({
      preAuthSessionId: prelogin.id, email, emailHash: sha256(email),
      passwordVerifier: await hashPassword('old secure password 2026!'),
      displayName: 'Password Reset QA', verificationTokenHash: sha256(verificationToken),
    });
    const member = await local.completeRegistration(verificationToken);
    const resetToken = randomToken();
    expect(await local.startPasswordReset(sha256(email), sha256(resetToken))).toBe(true);
    expect(await local.completePasswordReset(resetToken, await hashPassword('new secure password 2026!'))).toBe(true);
    expect(await local.completePasswordReset(resetToken, await hashPassword('another secure password 2026!'))).toBe(false);
    const { rows } = await pool.query<{ revoked_at: Date | null }>('SELECT revoked_at FROM public.auth_sessions WHERE id=$1', [member.session_id]);
    expect(rows[0]?.revoked_at).not.toBeNull();
  });
});
