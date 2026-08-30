import type { CanActivate, ExecutionContext } from '@nestjs/common';
import {
  ForbiddenException,
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { RequestWithSession } from '../session.context';
import { SessionRepository } from '../session.repository';

/**
 * An administrator route needs an open console session, not merely a session
 * belonging to somebody who holds a role.
 *
 * The console session is a separate, rotated session with a thirty-minute
 * life and a ten-minute idle lock — a member session is eight hours, and
 * eight hours of unattended access to every control in the system is what the
 * revised specification (§10 관리자 세션 분리) says must stop. Opening one
 * costs a reauthentication and a second factor; this guard only asks whether
 * the one in hand is still open, and `admin_session_touch` moves the idle
 * clock forward as a side effect of asking.
 *
 * A locked or expired console session answers 401, not 403: the caller is an
 * administrator and the remedy is to prove it again, which is what a 401
 * means. Having no console session at all is 403 — the request never went
 * through the door.
 */
@Injectable()
export class AdminSessionGuard implements CanActivate {
  constructor(
    // @Inject for the reason given in ReauthGuard: the declared type is a
    // union, which erases to Object in design:paramtypes.
    @Inject(SessionRepository) private readonly sessions: SessionRepository | null,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.sessions) throw new ServiceUnavailableException('session store unavailable');
    const request = context.switchToHttp().getRequest<RequestWithSession>();
    const sessionId = request.session?.id;
    const userId = request.session?.user_id;
    if (!sessionId || !userId) throw new ForbiddenException('administrator session required');

    const status = await this.sessions.touchAdminSession(sessionId, userId);
    request.adminSession = status;
    if (status.state === 'open') return true;
    if (status.state === 'idle_locked') {
      throw new UnauthorizedException('administrator session is locked');
    }
    if (status.state === 'expired') throw new UnauthorizedException('administrator session expired');
    throw new ForbiddenException('administrator session required');
  }
}
