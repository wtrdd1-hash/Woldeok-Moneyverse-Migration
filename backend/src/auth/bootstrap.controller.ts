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

/**
 * What a page needs *before* it can assume a session.
 *
 * The original rendered every page from Express, so it could create a
 * pre-login session, plant a CSRF token in the markup and read the published
 * policy version in one pass. A Next server component cannot: it reaches the
 * API over HTTP and, in Next 15, may not set a cookie while rendering. These
 * four routes are that pass, split into the parts a page can call.
 *
 * None of them carries SessionGuard. Every other route in the application
 * requires a session and answers 401 without one, which is correct there and
 * useless here: these exist precisely to serve a visitor who has none.
 */
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

  /**
   * The published policy version pair, which the consent form has to submit
   * back verbatim. Public: a visitor with no session still has to read it.
   */
  @Get('policy')
  @ApiOperation({ summary: 'Currently published consent version' })
  async policy() {
    const policy = await this.store().currentConsentVersion();
    if (!policy) throw new ServiceUnavailableException('published policy is unavailable');
    return { termsVersion: policy.terms_version, privacyVersion: policy.privacy_version };
  }

  /**
   * Which sign-in providers are configured. Derived from config alone, so it
   * reveals only what the login screen already has to show — a provider whose
   * credentials are missing is rendered as unavailable rather than as a link
   * that fails after the redirect.
   */
  @Get('providers')
  @ApiOperation({ summary: 'Sign-in providers this deployment can offer' })
  providers() {
    return {
      providers: [
        { id: 'discord' as const, enabled: this.config.oauth.discord.enabled },
        { id: 'google' as const, enabled: this.config.oauth.google.enabled },
      ],
    };
  }

  /**
   * Who the caller is, tolerantly. Every navigation renders from this, so it
   * answers 200 for a visitor with no cookie rather than 401 — a signed-out
   * reader is a normal state of this application, not an error.
   *
   * It returns no CSRF token: only a server action mutates, and each one
   * fetches its own token immediately before use, so no token is ever held by
   * a page or reaches the browser.
   */
  @Get('viewer')
  @ApiOperation({ summary: 'Session state for rendering navigation' })
  async viewer(@Req() request: RequestWithSession) {
    const anonymous = { signedIn: false, consentCurrent: false, adminRoles: [] as string[] };
    if (!this.sessions) return anonymous;

    const session = await this.sessions.get(sessionToken(request.headers, this.config));
    if (!session?.user_id) return anonymous;

    const consentCurrent = await this.sessions.hasCurrentUserConsent(session.id);
    // Roles are looked up only for a member who has accepted the current
    // policy, because that is the only member allowed to reach an admin page.
    // A failure here degrades to "no roles": the navigation must still render
    // when the role store is briefly unavailable.
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

  /**
   * Establishes the pre-login session the consent step writes against, and
   * hands back its CSRF token.
   *
   * Idempotent on purpose: a caller that already holds a usable pre-login
   * session gets a rotated token for it rather than a second session, so a
   * reloaded consent form does not strand the first one. A session already
   * bound to a member is left completely alone — reissuing here would revoke
   * nothing and confuse the caller into thinking it had signed out.
   */
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
