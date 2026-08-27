import type { CanActivate, ExecutionContext } from '@nestjs/common';
import {
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { AppConfig } from '../../core/config';
import { CONFIG } from '../../core/config';
import { sessionToken } from '../cookies';
import type { RequestWithSession } from '../session.context';
import { SessionRepository } from '../session.repository';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    // @Inject is required, not decorative: the parameter's declared type is
    // the union `SessionRepository | null`, which TypeScript erases to Object
    // in design:paramtypes. Without an explicit token Nest cannot resolve it.
    @Inject(SessionRepository) private readonly sessions: SessionRepository | null,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.sessions) throw new ServiceUnavailableException('session store unavailable');
    const request = context.switchToHttp().getRequest<RequestWithSession>();
    const session = await this.sessions.get(sessionToken(request.headers, this.config));
    if (!session) throw new UnauthorizedException('login required');
    request.session = session;
    return true;
  }
}
