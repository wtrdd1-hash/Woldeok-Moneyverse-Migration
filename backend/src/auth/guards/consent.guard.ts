import type { CanActivate, ExecutionContext } from '@nestjs/common';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { RequestWithSession } from '../session.context';
import { SessionRepository } from '../session.repository';

@Injectable()
export class ConsentGuard implements CanActivate {
  // Nullable for the same reason as SessionGuard: the provider factory yields
  // null when no DATABASE_URL is set, and Nest injects that regardless of
  // which guard ran first. Typing it non-null would turn an offline store
  // into a TypeError and a 500 instead of an honest 503.
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
    if (!sessionId || !(await this.sessions.hasCurrentUserConsent(sessionId))) {
      // 428 Precondition Required: the request is well formed and the caller
      // is authenticated, but the current policy version has not been
      // accepted. A 403 would suggest the action is never permitted.
      throw new HttpException('current policy consent required', HttpStatus.PRECONDITION_REQUIRED);
    }
    return true;
  }
}
