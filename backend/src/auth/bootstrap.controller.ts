import {
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AdminRolesRepository } from './admin-roles.repository';
import type { AppConfig } from '../core/config';
import { CONFIG } from '../core/config';
import { sessionCookie, sessionToken } from './cookies';
import type { RequestWithSession } from './session.context';
import { SessionRepository } from './session.repository';

@ApiTags('auth')
@Controller('auth')
export class AuthBootstrapController {
  constructor(
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(SessionRepository) private readonly sessions: SessionRepository | null,
    private readonly adminRoles: AdminRolesRepository,
  ) {}

  private store(): SessionRepository {
    if (!this.sessions) throw new ServiceUnavailableException('authentication storage unavailable');
    return this.sessions;
  }

  @Get('policy')
  @ApiOperation({ summary: 'Currently published consent version' })
  async policy() {
    const policy = await this.store().currentConsentVersion();
    if (!policy) throw new ServiceUnavailableException('published policy is unavailable');
    return { termsVersion: policy.terms_version, privacyVersion: policy.privacy_version };
  }

  @Get('providers')
  @ApiOperation({ summary: 'Sign-in providers this deployment can offer' })
  providers() {
    return {
      providers: [
        { id: 'local_email' as const, enabled: Boolean(this.sessions) },
        { id: 'discord' as const, enabled: this.config.oauth.discord.enabled },
        { id: 'google' as const, enabled: this.config.oauth.google.enabled },
      ],
    };
  }

  @Get('viewer')
  @ApiOperation({ summary: 'Session state for rendering navigation' })
  async viewer(@Req() request: RequestWithSession) {
    const anonymous = { signedIn: false, consentCurrent: false, adminRoles: [] as string[] };
    if (!this.sessions) return anonymous;

    const session = await this.sessions.get(sessionToken(request.headers, this.config));
    if (!session?.user_id) return anonymous;

    const consentCurrent = await this.sessions.hasCurrentUserConsent(session.id);
    let adminRoles: string[] = [];
    if (consentCurrent) {
      try {
        adminRoles = await this.adminRoles.currentRoles(session.user_id);
      } catch {
        adminRoles = [];
      }
    }
    return { signedIn: true, consentCurrent, adminRoles };
  }

  @Post('prelogin-session')
  @ApiOperation({ summary: 'Create or reuse the pre-login session' })
  async preloginSession(
    @Req() request: RequestWithSession,
    @Res({ passthrough: true }) response: Response,
  ) {
    const existing = await this.store().get(sessionToken(request.headers, this.config));
    if (existing?.user_id) return { signedIn: true, csrfToken: null };
    if (existing) {
      return { signedIn: false, csrfToken: await this.store().rotateCsrf(existing.id) };
    }
    const created = await this.store().create();
    response.setHeader('set-cookie', sessionCookie(created.token, this.config));
    return { signedIn: false, csrfToken: created.csrfToken };
  }
}
