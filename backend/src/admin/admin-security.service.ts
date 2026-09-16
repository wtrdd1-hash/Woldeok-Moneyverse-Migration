import { Injectable } from '@nestjs/common';
import type { AdminSessionStatus, OpenedAdminSession, SessionRepository } from '../auth/session.repository';
import type { AdminLoginPolicyRepository, LoginPolicyRow } from './admin-login-policy.repository';

/** Administrator session, address policy and remote-session operations. TOTP/2FA was retired. */
@Injectable()
export class AdminSecurityService {
  constructor(private readonly dependencies: {
    readonly policy: AdminLoginPolicyRepository;
    readonly sessions: SessionRepository;
  }) {}

  evaluateLoginContext(input: { readonly userId: string; readonly ipAddress: string | null; readonly deviceHash: string | null }) {
    return this.dependencies.policy.evaluate(input);
  }
  loginPolicy(actorUserId: string, targetUserId: string): Promise<LoginPolicyRow[]> {
    return this.dependencies.policy.loginPolicy(actorUserId, targetUserId);
  }
  setIpAllowlist(input: { readonly idempotencyKey: string; readonly actorUserId: string; readonly targetUserId: string; readonly networks: readonly string[]; readonly reason: string }) {
    return this.dependencies.policy.setIpAllowlist(input);
  }
  consoleSession(sessionId: string, userId: string): Promise<AdminSessionStatus> {
    return this.dependencies.sessions.touchAdminSession(sessionId, userId);
  }
  openConsoleSession(sessionId: string, userId: string): Promise<OpenedAdminSession> {
    return this.dependencies.sessions.openAdminSession(sessionId, userId);
  }
  closeConsoleSession(sessionId: string, userId: string): Promise<boolean> {
    return this.dependencies.sessions.closeAdminSession(sessionId, userId);
  }
  forceLogout(input: { readonly idempotencyKey: string; readonly actorUserId: string; readonly targetUserId: string; readonly reason: string }) {
    return this.dependencies.sessions.forceLogout(input);
  }
}
