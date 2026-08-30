import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  ServiceUnavailableException,
  UseGuards,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsString, MaxLength } from 'class-validator';
import type { Response } from 'express';
import { AccountService } from '../account/account.service';
import type { AppConfig } from '../core/config';
import { CONFIG } from '../core/config';
import { authorizationUrl, createOAuthChallenge } from './crypto';
import type { OAuthProvider } from './crypto';
import { clearSessionCookie, sessionCookie } from './cookies';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { ConsentGuard } from './guards/consent.guard';
import { CsrfGuard } from './guards/csrf.guard';
import { SessionGuard } from './guards/session.guard';
import { OAuthClient, OAuthProviderError } from './oauth-client';
import type { RequestWithSession } from './session.context';
import { selectRedirectUri } from '../core/config';
import { requireSession } from './session.context';
import { SessionRepository } from './session.repository';

const PROVIDERS: readonly OAuthProvider[] = ['discord', 'google'];

function asProvider(value: string): OAuthProvider | null {
  return (PROVIDERS as readonly string[]).includes(value) ? (value as OAuthProvider) : null;
}

export class ConsentDto {
  @ApiProperty()
  @IsBoolean()
  readonly termsCompleted!: boolean;

  @ApiProperty()
  @IsBoolean()
  readonly privacyCompleted!: boolean;

  @ApiProperty()
  @IsBoolean()
  readonly ageConfirmed!: boolean;

  @ApiProperty({ maxLength: 64 })
  @IsString()
  @MaxLength(64)
  readonly termsVersion!: string;

  @ApiProperty({ maxLength: 64 })
  @IsString()
  @MaxLength(64)
  readonly privacyVersion!: string;
}

export class ReauthenticationStartDto {
  @ApiProperty({ enum: ['link', 'reauth'] })
  @IsIn(['link', 'reauth'])
  readonly purpose!: 'link' | 'reauth';
}

/**
 * The session lifecycle: pre-login consent, the OAuth round trip, and logout.
 *
 * One callback serves three purposes — login, linking another sign-in method,
 * and step-up reauthentication — because the provider redirects to a single
 * registered URI. Which one applies is decided by the *stored* challenge's
 * purpose, never by anything in the incoming request, so a caller cannot turn
 * a link into a login by editing the URL.
 */
@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(SessionRepository) private readonly sessions: SessionRepository | null,
    @Inject(OAuthClient) private readonly oauth: OAuthClient,
    @Inject(AccountService) private readonly account: AccountService | null,
  ) {}

  private store(): SessionRepository {
    if (!this.sessions) throw new ServiceUnavailableException('authentication storage unavailable');
    return this.sessions;
  }

  /**
   * Returns the enabled branch of the union, so callers read `clientId` and
   * `redirectUri` without a cast or a non-null assertion.
   */
  private providerConfig(provider: OAuthProvider) {
    const providerConfig = this.config.oauth[provider];
    if (!providerConfig.enabled) throw new ServiceUnavailableException('OAuth is not configured');
    return providerConfig;
  }

  /**
   * What the front end needs to render an authenticated page: a fresh CSRF
   * token, and whether this session may write.
   *
   * New. The original rendered EJS server-side and planted the token into the
   * markup with `rotateCsrf` on every page render; a Next page cannot reach
   * into the session store, so the token needs a route. Rotating on read keeps
   * the original's behaviour — a token belongs to one page load.
   *
   * It deliberately returns no user id, display name or balance. Everything
   * about the member comes from the endpoint that owns it, so this cannot
   * become a second, staler source of the same facts.
   */
  @Get('auth/session')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
  @ApiOperation({ summary: 'CSRF token for the current session' })
  async session(@Req() request: RequestWithSession) {
    const csrfToken = await this.store().rotateCsrf(requireSession(request).id);
    return { csrfToken };
  }

  @Put('auth/consent')
  @UseGuards(SessionGuard, CsrfGuard)
  @ApiOperation({ summary: 'Record pre-login policy acknowledgement' })
  async consent(@Req() request: RequestWithSession, @Body() body: ConsentDto) {
    const session = requireSession(request);
    // Deliberately not AuthenticatedGuard: this is the gate a visitor passes
    // *before* logging in, so a session already bound to a user is wrong here.
    if (session.user_id) throw new ForbiddenException('pre-login session required');
    try {
      await this.store().grantPreloginConsent(session.id, { ...body });
    } catch {
      throw new ConflictException('policy changed or pre-login session expired');
    }
    return { next: '/login/providers' };
  }

  @Post('auth/logout')
  @HttpCode(204)
  @UseGuards(SessionGuard, CsrfGuard)
  @ApiOperation({ summary: 'End the session' })
  async logout(@Req() request: RequestWithSession, @Res({ passthrough: true }) response: Response) {
    await this.store().revoke(requireSession(request).id);
    response.setHeader('set-cookie', clearSessionCookie(this.config));
  }

  @Post('auth/:provider/reauthentication')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiOperation({ summary: 'Begin step-up reauthentication with a provider' })
  async startReauthentication(
    @Req() request: RequestWithSession,
    @Param('provider') providerName: string,
  ) {
    return this.startChallenge(request, providerName, 'reauth');
  }

  @Post('account/identities/:provider/link')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiOperation({ summary: 'Begin linking another sign-in method' })
  async startLink(@Req() request: RequestWithSession, @Param('provider') providerName: string) {
    return this.startChallenge(request, providerName, 'link');
  }

  /**
   * The origin the browser used, relayed by the frontend as `x-public-origin`.
   *
   * Untrusted on its own and not treated as trusted: `selectRedirectUri`
   * matches it against the registered list and falls back to the canonical URI
   * when it matches nothing, so a forged header buys the ordinary sign-in
   * rather than a redirect anywhere else. The API is reachable only from the
   * compose network and only with the internal token, so the header's author
   * is the frontend.
   */
  private publicOrigin(request: RequestWithSession): string | undefined {
    const header = (request.headers as Record<string, unknown>)['x-public-origin'];
    if (typeof header !== 'string' || header.length === 0) return undefined;
    try {
      return new URL(header).origin;
    } catch {
      return undefined;
    }
  }

  private async startChallenge(
    request: RequestWithSession,
    providerName: string,
    purpose: 'link' | 'reauth',
  ): Promise<{ authorizationUrl: string }> {
    const provider = asProvider(providerName);
    if (!provider) throw new ServiceUnavailableException('OAuth is not configured');
    const providerConfig = this.providerConfig(provider);
    const challenge = createOAuthChallenge(
      provider,
      selectRedirectUri(providerConfig, this.publicOrigin(request)),
    );
    await this.store().createChallenge(requireSession(request).id, challenge, purpose);
    return {
      authorizationUrl: authorizationUrl(provider, challenge, providerConfig.clientId),
    };
  }

  /**
   * Unversioned: the provider redirects the browser here, and the URI is
   * registered with Discord and Google. It must not move when the API version
   * does.
   */
  @Get('auth/:provider/authorize')
  @Version(VERSION_NEUTRAL)
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Begin login with a provider' })
  async authorize(@Req() request: RequestWithSession, @Param('provider') providerName: string) {
    const provider = asProvider(providerName);
    if (!provider) throw new ServiceUnavailableException('OAuth is not configured');
    const providerConfig = this.providerConfig(provider);
    const session = requireSession(request);
    if (!(await this.store().hasCurrentPreloginConsent(session.id))) {
      throw new ForbiddenException('consent required');
    }
    const challenge = createOAuthChallenge(
      provider,
      selectRedirectUri(providerConfig, this.publicOrigin(request)),
    );
    await this.store().createChallenge(session.id, challenge, 'login');
    return { authorizationUrl: authorizationUrl(provider, challenge, providerConfig.clientId) };
  }

  @Get('auth/:provider/callback')
  @Version(VERSION_NEUTRAL)
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Complete an OAuth round trip' })
  async callback(
    @Req() request: RequestWithSession,
    @Res({ passthrough: true }) response: Response,
    @Param('provider') providerName: string,
    @Query('state') state?: string,
    @Query('code') code?: string,
    @Query('error') providerError?: string,
  ) {
    const provider = asProvider(providerName);
    if (!provider) throw new ServiceUnavailableException('OAuth is not configured');
    const providerConfig = this.providerConfig(provider);
    const session = requireSession(request);

    // Consuming the challenge is what makes it single use, so it happens
    // before anything that could return early on the provider's own error.
    const challenge = await this.store().consumeChallenge({
      sessionId: session.id,
      provider,
      state,
    });
    // Membership rather than equality: the round trip may legitimately have
    // started on any registered origin, and the stored challenge is what says
    // which. Still a closed set -- a challenge naming an origin that has since
    // been withdrawn no longer completes.
    if (!challenge || !providerConfig.redirectUris.includes(challenge.redirect_uri)) {
      throw new BadRequestException('oauth_state');
    }
    if (providerError) throw new BadRequestException('oauth_cancelled');
    if (!code) throw new BadRequestException('oauth_response');

    // The stored purpose decides, not the request.
    const purpose = challenge.purpose ?? (session.user_id ? 'link' : 'login');

    let identity;
    try {
      identity = await this.oauth.authenticate({
        provider,
        code,
        codeVerifier: challenge.code_verifier,
        nonceHash: challenge.nonce_hash,
        providerConfig,
        redirectUri: challenge.redirect_uri,
      });
    } catch (error: unknown) {
      if (error instanceof OAuthProviderError) throw new BadRequestException('oauth_verification');
      throw error;
    }
    if (identity.provider !== provider) throw new BadRequestException('oauth_state');

    if (purpose === 'reauth') {
      const marked = await this.store().markReauthenticated(session.id, provider, identity.subject);
      if (!marked) throw new BadRequestException('reauthentication_failed');
      return { outcome: 'reauthenticated' as const };
    }

    if (purpose === 'link') {
      if (!this.account) throw new ServiceUnavailableException('account service is unavailable');
      if (!session.user_id) throw new ForbiddenException('login required');
      await this.account.linkVerifiedOAuthIdentity(session.user_id, identity);
      return { outcome: 'linked' as const, provider };
    }

    if (!(await this.store().hasCurrentPreloginConsent(session.id))) {
      throw new ForbiddenException('consent required');
    }
    const login = await this.store().completeOAuthLogin({
      preAuthSessionId: session.id,
      provider: identity.provider,
      subject: identity.subject,
      displayName: identity.displayName,
    });
    response.setHeader('set-cookie', sessionCookie(login.token, this.config));
    return { outcome: 'signed-in' as const, csrfToken: login.csrfToken };
  }
}
