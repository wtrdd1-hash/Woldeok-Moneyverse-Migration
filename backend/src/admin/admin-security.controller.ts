import { createHash } from 'node:crypto';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  Res,
  ServiceUnavailableException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';
import type { Response } from 'express';
import { clearSessionCookie, sessionCookie } from '../auth/cookies';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { SecondFactorGuard } from '../auth/guards/second-factor.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { SecondFactorInputError } from '../auth/second-factor.repository';
import type { RequestWithSession } from '../auth/session.context';
import { requireSession, requireUserId } from '../auth/session.context';
import type { AppConfig } from '../core/config';
import { CONFIG } from '../core/config';
import { isAuthorizationFailure, isExpectedCommandFailure } from '../core/pg-error';
import { requestClientKey } from '../security/rate-limit';
import {
  AdminSecurityService,
  SecondFactorRejectedError,
  SecondFactorUnavailableError,
} from './admin-security.service';

const REASON_MIN = 10;
const REASON_MAX = 1000;

export class SecondFactorCodeDto {
  @ApiProperty({ description: 'The six digit code from the authenticator app' })
  @IsString()
  @Matches(/^[0-9]{6,8}$/)
  readonly code!: string;
}

export class IpAllowlistDto {
  @ApiProperty({ type: [String], maxItems: 50, description: 'Networks in CIDR form' })
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(45, { each: true })
  readonly networks!: string[];

  @ApiProperty({ minLength: REASON_MIN, maxLength: REASON_MAX })
  @IsString()
  @MinLength(REASON_MIN)
  @MaxLength(REASON_MAX)
  readonly reason!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class ForcedLogoutDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly userId!: string;

  @ApiProperty({ minLength: REASON_MIN, maxLength: REASON_MAX })
  @IsString()
  @MinLength(REASON_MIN)
  @MaxLength(REASON_MAX)
  readonly reason!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

/**
 * How an administrator gets into the console, and what it costs.
 *
 * None of these routes carries `AdminSessionGuard` except the two that act on
 * somebody else: this is where a console session is obtained, so demanding
 * one first would be a door that can only be opened from inside.
 *
 * Opening one requires a fresh OAuth reauthentication (`ReauthGuard`) and a
 * TOTP code spent in the last five minutes, and it rotates the session — the
 * cookie the browser leaves with is not the one it arrived with. That is why
 * the response sets a cookie the way login does.
 */
@ApiTags('admin')
@Controller('admin/security')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard)
export class AdminSecurityController {
  constructor(
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(AdminSecurityService) private readonly security: AdminSecurityService | null,
    @Inject('ADMIN_DEVICE_PEPPER') private readonly devicePepper: string,
  ) {}

  private service(): AdminSecurityService {
    if (!this.security) throw new ServiceUnavailableException('admin security is unavailable');
    return this.security;
  }

  /**
   * A stable identifier for the browser, not for the person.
   *
   * The properties themselves are never stored — §14.9 limits the record to
   * what the purpose needs — and a per-deployment pepper stops the stored
   * hash being reversed by trying the few hundred common User-Agent strings.
   */
  private deviceHash(request: RequestWithSession): string {
    const agent = String(request.headers['user-agent'] ?? '');
    const language = String(request.headers['accept-language'] ?? '');
    return createHash('sha256')
      .update(`${this.devicePepper}|${agent}|${language}`)
      .digest('hex');
  }

  private clientAddress(request: RequestWithSession): string | null {
    const key = requestClientKey(request, {
      trustForwardedFor: this.config.trustProxyForwardedFor,
    });
    // `requestClientKey` answers 'unknown' when there is no socket address,
    // which is not an inet value and must not be handed to PostgreSQL as one.
    return key === 'unknown' ? null : key;
  }

  private async guarded<T>(work: () => Promise<T>, message: string): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (error instanceof SecondFactorUnavailableError) {
        throw new ServiceUnavailableException(error.message);
      }
      if (error instanceof SecondFactorRejectedError) {
        throw new UnauthorizedException('the authentication code is not valid');
      }
      if (error instanceof SecondFactorInputError) throw new BadRequestException(error.message);
      if (isAuthorizationFailure(error)) throw new BadRequestException(message);
      if (isExpectedCommandFailure(error)) throw new BadRequestException(message);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Second factor state, console session state and login policy' })
  async overview(@Req() request: RequestWithSession) {
    const session = requireSession(request);
    const actor = requireUserId(request);
    const service = this.service();
    const [secondFactor, policy, consoleSession] = await Promise.all([
      service.status(actor),
      service.loginPolicy(actor, actor),
      service.consoleSession(session.id, actor),
    ]);
    return {
      available: service.available,
      roles: request.adminRoles ?? [],
      secondFactor,
      consoleSession,
      loginPolicy: policy,
    };
  }

  @Post('second-factor')
  @UseGuards(CsrfGuard, ReauthGuard)
  @ApiOperation({ summary: 'Begin enrolling an authenticator app' })
  beginEnrolment(@Req() request: RequestWithSession) {
    const session = requireSession(request);
    return this.guarded(
      () =>
        this.service().beginEnrolment({
          userId: requireUserId(request),
          sessionId: session.id,
          // The label the authenticator app shows. Deliberately the internal
          // id rather than the display name: an app's list of accounts is
          // readable by anyone holding the phone.
          account: requireUserId(request),
        }),
      'enrolment could not be started',
    );
  }

  @Put('second-factor')
  @UseGuards(CsrfGuard, ReauthGuard)
  @ApiOperation({ summary: 'Confirm the enrolment with a code from the app' })
  async confirmEnrolment(
    @Req() request: RequestWithSession,
    @Body() body: SecondFactorCodeDto,
  ) {
    const session = requireSession(request);
    const confirmed = await this.guarded(
      () =>
        this.service().confirmEnrolment({
          userId: requireUserId(request),
          sessionId: session.id,
          code: body.code,
        }),
      'the enrolment could not be confirmed',
    );
    return { confirmed };
  }

  @Post('second-factor/verifications')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Spend a code, which is what a step-up costs' })
  verify(@Req() request: RequestWithSession, @Body() body: SecondFactorCodeDto) {
    return this.guarded(
      () =>
        this.service().verify({
          userId: requireUserId(request),
          code: body.code,
          deviceHash: this.deviceHash(request),
          deviceLabel: String(request.headers['user-agent'] ?? '').slice(0, 100),
        }),
      'the code could not be verified',
    );
  }

  @Post('sessions')
  @UseGuards(CsrfGuard, ReauthGuard)
  @ApiOperation({ summary: 'Enter the operations console, rotating the session' })
  async openConsole(
    @Req() request: RequestWithSession,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = requireSession(request);
    const actor = requireUserId(request);
    const service = this.service();

    // The address and device policy, before anything else. A sign-in from
    // outside a registered network is refused here rather than challenged:
    // the challenge has already happened, and the point of the allowlist is
    // that passing it is not optional.
    const context = await service.evaluateLoginContext({
      userId: actor,
      ipAddress: this.clientAddress(request),
      deviceHash: this.deviceHash(request),
    });
    if (context.decision === 'block') throw new ForbiddenException(context.reason);

    const opened = await this.guarded(
      () => service.openConsoleSession(session.id, actor),
      'the console session could not be opened',
    );
    response.setHeader('set-cookie', sessionCookie(opened.token, this.config));
    return {
      state: opened.state,
      expiresAt: opened.expiresAt,
      idleExpiresAt: opened.idleExpiresAt,
      csrfToken: opened.csrfToken,
      loginContext: context,
    };
  }

  @Delete('sessions')
  @HttpCode(204)
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Leave the operations console' })
  async closeConsole(
    @Req() request: RequestWithSession,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Closing revokes the rotated session outright rather than demoting it to
    // a member session: the console session IS the session, and handing back
    // a still-live token that had console rights a moment ago is exactly what
    // rotating it on the way in was for. The cookie goes with it, so the
    // browser is not left holding a token every request will now refuse.
    await this.service().closeConsoleSession(requireSession(request).id, requireUserId(request));
    response.setHeader('set-cookie', clearSessionCookie(this.config));
  }

  @Put('login-policies/:userId')
  @UseGuards(AdminSessionGuard, CsrfGuard, ReauthGuard, SecondFactorGuard)
  @ApiOperation({ summary: 'Replace the address allowlist for an administrator' })
  setIpAllowlist(
    @Req() request: RequestWithSession,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() body: IpAllowlistDto,
  ) {
    return this.guarded(
      () =>
        this.service().setIpAllowlist({
          idempotencyKey: body.idempotencyKey,
          actorUserId: requireUserId(request),
          targetUserId: userId,
          networks: body.networks,
          reason: body.reason,
        }),
      'the allowlist was not changed',
    );
  }

  @Post('forced-logouts')
  @UseGuards(AdminSessionGuard, CsrfGuard, ReauthGuard, SecondFactorGuard)
  @ApiOperation({ summary: 'End every live session a member holds' })
  forceLogout(@Req() request: RequestWithSession, @Body() body: ForcedLogoutDto) {
    return this.guarded(
      () =>
        this.service().forceLogout({
          idempotencyKey: body.idempotencyKey,
          actorUserId: requireUserId(request),
          targetUserId: body.userId,
          reason: body.reason,
        }),
      'no session was ended',
    );
  }
}
