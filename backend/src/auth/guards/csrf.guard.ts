import type { CanActivate, ExecutionContext } from '@nestjs/common';
import {
  ForbiddenException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { RequestWithSession } from '../session.context';
import { SessionRepository } from '../session.repository';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(
    // @Inject is required, not decorative: the parameter's declared type is
    // the union `SessionRepository | null`, which TypeScript erases to Object
    // in design:paramtypes. Without an explicit token Nest cannot resolve it.
    @Inject(SessionRepository) private readonly sessions: SessionRepository | null,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithSession>();
    if (SAFE_METHODS.has(request.method)) return true;
    // Checked after the safe-method exit so a read still works with the store
    // offline, and before any token comparison so an unavailable store can
    // never be mistaken for a valid token.
    if (!this.sessions) throw new ServiceUnavailableException('session store unavailable');

    const presented = request.headers['x-csrf-token'];
    const sessionId = request.session?.id;
    if (typeof presented !== 'string' || !sessionId) {
      throw new ForbiddenException('csrf token required');
    }
    if (!(await this.sessions.verifyCsrf(sessionId, presented))) {
      throw new ForbiddenException('csrf token rejected');
    }
    return true;
  }
}
