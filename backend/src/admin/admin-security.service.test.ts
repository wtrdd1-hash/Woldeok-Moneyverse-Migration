import { describe, expect, it, vi } from 'vitest';
import { sha256 } from '../auth/crypto';
import type { SecondFactorRepository } from '../auth/second-factor.repository';
import type { SessionRepository } from '../auth/session.repository';
import { AdminSecurityService, RecoveryCodeRejectedError } from './admin-security.service';

const USER = '00000000-0000-4000-8000-000000000001';
const SESSION = '00000000-0000-4000-8000-000000000002';

function service() {
  const factors = {
    issueRecoveryCodes: vi
      .fn()
      .mockResolvedValue({ count: 8, expiresAt: new Date('2026-12-01T00:00:00Z') }),
  } as unknown as SecondFactorRepository;
  const sessions = {
    openAdminSessionWithRecoveryCode: vi.fn(),
  } as unknown as SessionRepository;
  return {
    factors,
    sessions,
    subject: new AdminSecurityService({ factors, sessions, sealing: null, issuer: 'example.test' }),
  };
}

describe('administrator recovery codes', () => {
  it('reveals eight strong distinct codes while persisting only their hashes', async () => {
    const { subject, factors } = service();
    const result = await subject.issueRecoveryCodes(USER, SESSION);

    expect(result.codes).toHaveLength(8);
    expect(new Set(result.codes)).toHaveLength(8);
    expect(result.codes.every((code) => /^[A-Za-z0-9_-]{27}$/.test(code))).toBe(true);
    expect(factors.issueRecoveryCodes).toHaveBeenCalledWith(
      USER,
      SESSION,
      result.codes.map(sha256),
    );
    const persisted = vi.mocked(factors.issueRecoveryCodes).mock.calls[0]?.[2] ?? [];
    expect(persisted).not.toContain(result.codes[0]);
  });

  it('hashes a submitted code before asking the database to rotate the session', async () => {
    const { subject, sessions } = service();
    vi.mocked(sessions.openAdminSessionWithRecoveryCode).mockResolvedValue({
      sessionId: SESSION,
      token: 'token',
      csrfToken: 'csrf',
      state: 'open',
      expiresAt: new Date('2026-09-03T01:30:00Z'),
      idleExpiresAt: new Date('2026-09-03T01:10:00Z'),
    });
    await subject.openConsoleWithRecoveryCode(SESSION, USER, 'A'.repeat(27));
    expect(sessions.openAdminSessionWithRecoveryCode).toHaveBeenCalledWith(
      SESSION,
      USER,
      sha256('A'.repeat(27)),
    );
  });

  it('reports a consumed, unknown or locked code as one indistinguishable rejection', async () => {
    const { subject, sessions } = service();
    vi.mocked(sessions.openAdminSessionWithRecoveryCode).mockResolvedValue(null);
    await expect(
      subject.openConsoleWithRecoveryCode(SESSION, USER, 'A'.repeat(27)),
    ).rejects.toBeInstanceOf(RecoveryCodeRejectedError);
  });
});
