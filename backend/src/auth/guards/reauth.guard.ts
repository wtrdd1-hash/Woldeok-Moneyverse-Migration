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
    const recent =
      sessionId !== undefined &&
      (await this.sessions.hasRecentReauthentication(sessionId, REAUTHENTICATION_WINDOW_SECONDS));
    if (!recent) throw new UnauthorizedException('recent reauthentication required');
    return true;
  }
}
