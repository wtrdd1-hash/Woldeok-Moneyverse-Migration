import crypto from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl } from '../testing/database';
import { sha256, randomToken } from './crypto';
import { hashPassword } from './password-hasher';
import { LocalAuthRepository } from './local-auth.repository';
import { SessionRepository } from './session.repository';

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

    const completed = await local.completeRegistration(prelogin.id, verificationToken);
    expect(completed.user_id).toMatch(/^[0-9a-f-]{36}$/);
    expect(completed.is_new).toBe(true);
    expect(await sessions.hasCurrentUserConsent(completed.session_id)).toBe(true);
    expect((await local.credential(emailHash))?.user_id).toBe(completed.user_id);
  });
});
