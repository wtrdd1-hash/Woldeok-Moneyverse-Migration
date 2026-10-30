import type { CanActivate, ExecutionContext } from '@nestjs/common';
import {
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { RequestWithSession } from '../session.context';
import { SessionRepository } from '../session.repository';

/**
 * Sensitive actions — account deletion, unlinking an identity — require the
 * caller to have proved control of an OAuth identity recently, not merely to
 * hold a live session. The window matches the original application.
 */
const REAUTHENTICATION_WINDOW_SECONDS = 900;

@Injectable()
export class ReauthGuard implements CanActivate {
  constructor(
    // @Inject is required, not decorative: the parameter's declared type is
    // the union `SessionRepository | null`, which TypeScript erases to Object
    // in design:paramtypes. Without an explicit token Nest cannot resolve it.
    @Inject(SessionRepository) private readonly sessions: SessionRepository | null,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.sessions) throw new ServiceUnavailableException('session store unavailable');
    const request = context.switchToHttp().getRequest<RequestWithSession>();
    const sessionId = request.session?.id;
    // A verified, open administrator console session is sufficient for admin
    // operations: do not prompt the operator every 15 minutes. AdminGuard and
    // AdminSessionGuard must both have run successfully on this request.
    // Account-security routes still require fresh identity verification.
    if (
      sessionId &&
      request.adminRoles?.length &&
      request.adminSession?.state === 'open'
    ) {
      return true;
    }
    const recent =
      sessionId !== undefined &&
      (await this.sessions.hasRecentReauthentication(sessionId, REAUTHENTICATION_WINDOW_SECONDS));
    if (!recent) {
      // Coded, because the caller IS signed in: a reader that sees only 401
      // tells them to log in, which is both wrong and impossible to act on.
      throw new UnauthorizedException({
        message: 'recent reauthentication required',
        code: 'reauthentication_required',
      });
    }
    return true;
  }
}
