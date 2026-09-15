import { describe, expect, it, vi } from 'vitest';
import type { SessionRepository } from '../auth/session.repository';
import type { AdminLoginPolicyRepository } from './admin-login-policy.repository';
import { AdminSecurityService } from './admin-security.service';

const USER = '00000000-0000-4000-8000-000000000001';
const SESSION = '00000000-0000-4000-8000-000000000002';

describe('administrator security service after second-factor retirement', () => {
  it('opens the rotated console session without a TOTP dependency', async () => {
    const policy = { evaluate: vi.fn(), loginPolicy: vi.fn(), setIpAllowlist: vi.fn() } as unknown as AdminLoginPolicyRepository;
    const sessions = { openAdminSession: vi.fn().mockResolvedValue({ sessionId: SESSION, token: 't', csrfToken: 'c', state: 'open', expiresAt: new Date(), idleExpiresAt: new Date() }) } as unknown as SessionRepository;
    const subject = new AdminSecurityService({ policy, sessions });
    await expect(subject.openConsoleSession(SESSION, USER)).resolves.toMatchObject({ state: 'open' });
    expect(sessions.openAdminSession).toHaveBeenCalledWith(SESSION, USER);
  });

  it('keeps the administrator network policy in force', async () => {
    const policy = { evaluate: vi.fn().mockResolvedValue({ decision: 'block', reason: 'address outside the administrator allowlist' }) } as unknown as AdminLoginPolicyRepository;
    const sessions = {} as SessionRepository;
    const subject = new AdminSecurityService({ policy, sessions });
    await expect(subject.evaluateLoginContext({ userId: USER, ipAddress: '203.0.113.4', deviceHash: null })).resolves.toMatchObject({ decision: 'block' });
  });
});
