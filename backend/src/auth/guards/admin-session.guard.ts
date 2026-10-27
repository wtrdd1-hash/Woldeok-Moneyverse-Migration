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
 * Migration 246 changed the admin console's lifetime to 30 days and its idle
 * lock to 24 hours, while eliminating its separate entry-time challenge.
 * Retired TOTP is never required to open the console. Sensitive endpoints can
 * still independently demand recent OAuth or local-password verification.
 * This guard checks the rotated console session via `admin_session_touch`,
 * which also advances the activity timestamp.
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
