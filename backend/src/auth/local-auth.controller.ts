import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Inject,
  Post,
  Req,
  Res,
  ServiceUnavailableException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import type { Response } from 'express';
import type { AppConfig } from '../core/config';
import { CONFIG } from '../core/config';
import { sessionCookie } from './cookies';
import { randomToken, sha256 } from './crypto';
import { CsrfGuard } from './guards/csrf.guard';
import { SessionGuard } from './guards/session.guard';
import { ReauthGuard } from './guards/reauth.guard';
import { LocalAuthRepository } from './local-auth.repository';
import { hashPassword, spendDummyPasswordWork, verifyPassword } from './password-hasher';
import type { RequestWithSession } from './session.context';
import { requireSession } from './session.context';
import { SessionRepository } from './session.repository';
import { VerificationEmailSender } from './verification-email.sender';

const COMMON_PASSWORDS = new Set([
  'password',
  'passwordpassword',
  '1234',
  '123456',
  '12345678',
  '123456789',
  '123456789012345',
  'qwerty',
  'qwertyqwertyqwerty',
  'letmein',
  'letmeinletmeinletmein',
  'admin',
  '111111',
  'abc123',
]);

function normalizeEmail(value: string): string {
  return value.trim().normalize('NFC').toLowerCase();
}

function emailHash(value: string): string {
  return sha256(normalizeEmail(value));
}

const COMMON_EMAIL_DOMAIN_TYPOS: Readonly<Record<string, string>> = {
  'nvaer.com': 'naver.com',
  'navre.com': 'naver.com',
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'hotamil.com': 'hotmail.com',
};

export function suggestedEmailForKnownDomainTypo(email: string): string | null {
  const normalized = normalizeEmail(email);
  const separator = normalized.lastIndexOf('@');
  if (separator < 1) return null;
  const localPart = normalized.slice(0, separator);
  const domain = normalized.slice(separator + 1);
  const correctedDomain = COMMON_EMAIL_DOMAIN_TYPOS[domain];
  return correctedDomain ? `${localPart}@${correctedDomain}` : null;
}

export function acceptablePassword(password: string): boolean {
  const normalized = password.normalize('NFC');
  const codePointLength = Array.from(normalized).length;
  return (
    codePointLength > 0 &&
    codePointLength <= 128 &&
    !COMMON_PASSWORDS.has(normalized.toLowerCase())
  );
}

export class LocalRegisterDto {
  @ApiProperty({ example: 'member@example.com', maxLength: 254 })
  @IsEmail()
  @MaxLength(254)
  readonly email!: string;

  @ApiProperty({
    maxLength: 128,
    description: 'Non-empty password. No numeric minimum length is enforced.',
  })
  @IsString()
  @MaxLength(128)
  readonly password!: string;

  @ApiProperty({ minLength: 2, maxLength: 120 })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  readonly displayName!: string;
}

export class LocalLoginDto {
  @ApiProperty({ example: 'member@example.com', maxLength: 254 })
  @IsEmail()
  @MaxLength(254)
  readonly email!: string;

  @ApiProperty({ maxLength: 128 })
  @IsString()
  @MaxLength(128)
  readonly password!: string;
}

export class LocalReauthenticationDto {
  @ApiProperty({ example: 'member@example.com', maxLength: 254 })
  @IsEmail()
  @MaxLength(254)
  readonly email!: string;

  @ApiProperty({ maxLength: 128 })
  @IsString()
  @MaxLength(128)
  readonly password!: string;
}


export class LocalEmailChangeRequestDto {
  @ApiProperty({ example: 'new-email@example.com', maxLength: 254 }) @IsEmail() @MaxLength(254) readonly email!: string;
}
export class LocalEmailChangeCompleteDto {
  @ApiProperty({ minLength: 32, maxLength: 512 }) @IsString() @MinLength(32) @MaxLength(512) readonly token!: string;
}

export class LocalPasswordChangeDto {
  @ApiProperty({ maxLength: 128 })
  @IsString()
  @MaxLength(128)
  readonly password!: string;
}

export class LocalPasswordResetRequestDto {
  @ApiProperty({ example: 'member@example.com', maxLength: 254 })
  @IsEmail()
  @MaxLength(254)
  readonly email!: string;
}

export class LocalPasswordResetCompleteDto {
  @ApiProperty({ minLength: 32, maxLength: 512 })
  @IsString()
  @MinLength(32)
  @MaxLength(512)
  readonly token!: string;

  @ApiProperty({ maxLength: 128 })
  @IsString()
  @MaxLength(128)
  readonly password!: string;
}

export class LocalVerifyDto {
  @ApiProperty({ minLength: 32, maxLength: 512 })
  @IsString()
  @MinLength(32)
  @MaxLength(512)
  readonly token!: string;
}

@ApiTags('auth')
@Controller('auth/local')
export class LocalAuthController {
  constructor(
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(SessionRepository) private readonly sessions: SessionRepository | null,
    @Inject(LocalAuthRepository) private readonly localAuth: LocalAuthRepository | null,
    private readonly verificationEmails: VerificationEmailSender,
  ) {}

  private sessionStore(): SessionRepository {
    if (!this.sessions) throw new ServiceUnavailableException('authentication storage unavailable');
    return this.sessions;
  }

  private credentialStore(): LocalAuthRepository {
    if (!this.localAuth) throw new ServiceUnavailableException('local authentication unavailable');
    return this.localAuth;
  }

  @Post('register')
  @HttpCode(202)
  @UseGuards(SessionGuard, CsrfGuard)
  @ApiOperation({ summary: 'Start first-party email/password registration' })
  async register(@Req() request: RequestWithSession, @Body() body: LocalRegisterDto) {
    const session = requireSession(request);
    if (session.user_id) throw new ForbiddenException('already signed in');
    if (!(await this.sessionStore().hasCurrentPreloginConsent(session.id))) {
      throw new ForbiddenException('current policy consent required');
    }
    if (!acceptablePassword(body.password)) {
      throw new ForbiddenException('password does not meet policy');
    }

    const email = normalizeEmail(body.email);
    const suggestedEmail = suggestedEmailForKnownDomainTypo(email);
    if (suggestedEmail) {
      throw new BadRequestException(`email domain looks mistyped; did you mean ${suggestedEmail}?`);
    }
    const token = randomToken();
    const accepted = await this.credentialStore().startRegistration({
      preAuthSessionId: session.id,
      email,
      emailHash: emailHash(email),
      passwordVerifier: await hashPassword(body.password),
      displayName: body.displayName,
      verificationTokenHash: sha256(token),
    });

    if (accepted) {
      try {
        await this.verificationEmails.send({ to: email, token, baseUrl: this.config.baseUrl });
      } catch (error) {
        // Production must never claim that verification was dispatched when
        // there is no functioning delivery path. Development keeps the
        // existing token-in-response escape hatch for isolated local work.
        if (this.config.production && !this.config.localAuthTestVerificationTokenEnabled) throw error;
      }
    }

    return {
      accepted: true,
      verificationRequired: true,
      ...((this.config.production && !this.config.localAuthTestVerificationTokenEnabled) || !accepted
        ? {}
        : { verificationToken: token }),
    };
  }

  @Post('password-reset/request')
  @HttpCode(202)
  @ApiOperation({ summary: 'Request a one-time local password reset link' })
  async requestPasswordReset(@Body() body: LocalPasswordResetRequestDto) {
    const email = normalizeEmail(body.email);
    const token = randomToken();
    const accepted = await this.credentialStore().startPasswordReset(emailHash(email), sha256(token));
    if (accepted) {
      try {
        await this.verificationEmails.send({
          to: email, token, baseUrl: this.config.baseUrl, purpose: 'password-reset',
        });
      } catch {
        // Keep the public response indistinguishable from an unknown address.
      }
    }
    return { accepted: true };
  }

  @Post('email-change/request')
  @HttpCode(202)
  @UseGuards(SessionGuard, CsrfGuard, ReauthGuard)
  @ApiOperation({ summary: 'Send a verification link for a new login email' })
  async requestEmailChange(@Req() request: RequestWithSession, @Body() body: LocalEmailChangeRequestDto) {
    const session = requireSession(request);
    if (!session.user_id) throw new ForbiddenException('login required');
    const email = normalizeEmail(body.email);
    const token = randomToken();
    const accepted = await this.credentialStore().startEmailChange(session.id, session.user_id, email, emailHash(email), sha256(token));
    if (!accepted) throw new BadRequestException('email change unavailable');
    await this.verificationEmails.send({ to: email, token, baseUrl: this.config.baseUrl, purpose: 'email-change' });
    return { accepted: true, verificationRequired: true };
  }

  @Post('email-change/complete')
  @ApiOperation({ summary: 'Verify and activate a new login email' })
  async completeEmailChange(@Body() body: LocalEmailChangeCompleteDto) {
    const completed = await this.credentialStore().completeEmailChange(body.token);
    if (!completed) throw new UnauthorizedException('email change failed');
    return { outcome: 'email-changed' as const, sessionsRevoked: true };
  }

  @Post('password/change')
  @UseGuards(SessionGuard, CsrfGuard, ReauthGuard)
  @ApiOperation({ summary: 'Change the current local password after recent reauthentication' })
  async changePassword(@Req() request: RequestWithSession, @Body() body: LocalPasswordChangeDto) {
    const session = requireSession(request);
    if (!session.user_id) throw new ForbiddenException('login required');
    if (!acceptablePassword(body.password)) throw new ForbiddenException('password does not meet policy');
    const changed = await this.credentialStore().changePassword(session.id, session.user_id, await hashPassword(body.password));
    if (!changed) throw new ForbiddenException('local credential required');
    return { outcome: 'password-changed' as const };
  }

  @Post('password-reset/complete')
  @ApiOperation({ summary: 'Consume a password reset token and replace the local password' })
  async completePasswordReset(@Body() body: LocalPasswordResetCompleteDto) {
    if (!acceptablePassword(body.password)) {
      throw new ForbiddenException('password does not meet policy');
    }
    try {
      const completed = await this.credentialStore().completePasswordReset(
        body.token,
        await hashPassword(body.password),
      );
      if (!completed) throw new Error('password reset failed');
      return { outcome: 'password-reset' as const };
    } catch {
      throw new UnauthorizedException('password reset failed');
    }
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify first-party email and activate the account' })
  async verifyEmail(
    @Res({ passthrough: true }) response: Response,
    @Body() body: LocalVerifyDto,
  ) {
    try {
      const login = await this.credentialStore().completeRegistration(body.token);
      response.setHeader('set-cookie', sessionCookie(login.token, this.config));
      return { outcome: 'signed-in' as const, csrfToken: login.csrfToken, consentCurrent: true };
    } catch {
      throw new UnauthorizedException('verification failed');
    }
  }

  @Post('reauthentication')
  @UseGuards(SessionGuard, CsrfGuard)
  @ApiOperation({ summary: 'Confirm current member password' })
  async reauthenticate(@Req() request: RequestWithSession, @Body() body: LocalReauthenticationDto) {
    const session = requireSession(request);
    if (!session.user_id) throw new ForbiddenException('login required');
    const credential = await this.credentialStore().credential(emailHash(body.email));
    let valid = credential?.user_id === session.user_id;
    if (valid && credential) {
      try { valid = await verifyPassword(body.password, credential.password_verifier); }
      catch { valid = false; }
    } else {
      await spendDummyPasswordWork(body.password);
    }
    if (!valid) throw new UnauthorizedException('invalid credentials');
    if (!(await this.sessionStore().markLocalReauthenticated(session.id, session.user_id))) {
      throw new UnauthorizedException('reauthentication failed');
    }
    return { outcome: 'reauthenticated' as const };
  }

  @Post('login')
  @UseGuards(SessionGuard, CsrfGuard)
  @ApiOperation({ summary: 'Sign in with first-party email/password credentials' })
  async login(
    @Req() request: RequestWithSession,
    @Res({ passthrough: true }) response: Response,
    @Body() body: LocalLoginDto,
  ) {
    const session = requireSession(request);
    if (session.user_id) throw new ForbiddenException('already signed in');
    const hash = emailHash(body.email);
    const credential = await this.credentialStore().credential(hash);

    if (!credential) {
      await spendDummyPasswordWork(body.password);
      throw new UnauthorizedException('invalid credentials');
    }

    let valid = false;
    try {
      valid = await verifyPassword(body.password, credential.password_verifier);
    } catch {
      valid = false;
    }
    if (!valid) throw new UnauthorizedException('invalid credentials');

    try {
      const login = await this.credentialStore().completeLogin(
        session.id,
        credential.user_id,
        hash,
      );
      response.setHeader('set-cookie', sessionCookie(login.token, this.config));
      const consentCurrent = await this.sessionStore().hasCurrentUserConsent(login.session_id);
      return { outcome: 'signed-in' as const, csrfToken: login.csrfToken, consentCurrent };
    } catch {
      throw new UnauthorizedException('invalid credentials');
    }
  }
}
