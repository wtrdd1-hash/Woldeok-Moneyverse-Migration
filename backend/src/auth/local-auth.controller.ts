import {
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
import { LocalAuthRepository } from './local-auth.repository';
import { hashPassword, spendDummyPasswordWork, verifyPassword } from './password-hasher';
import type { RequestWithSession } from './session.context';
import { requireSession } from './session.context';
import { SessionRepository } from './session.repository';

const COMMON_PASSWORDS = new Set([
  'passwordpassword',
  '123456789012345',
  'qwertyqwertyqwerty',
  'letmeinletmeinletmein',
]);

function normalizeEmail(value: string): string {
  return value.trim().normalize('NFC').toLowerCase();
}

function emailHash(value: string): string {
  return sha256(normalizeEmail(value));
}

function acceptablePassword(password: string): boolean {
  const normalized = password.normalize('NFC');
  return normalized.length >= 15 && normalized.length <= 128 && !COMMON_PASSWORDS.has(normalized.toLowerCase());
}

export class LocalRegisterDto {
  @ApiProperty({ example: 'member@example.com', maxLength: 254 })
  @IsEmail()
  @MaxLength(254)
  readonly email!: string;

  @ApiProperty({ minLength: 15, maxLength: 128 })
  @IsString()
  @MinLength(15)
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

  @ApiProperty({ minLength: 1, maxLength: 128 })
  @IsString()
  @MinLength(1)
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
    const token = randomToken();
    const accepted = await this.credentialStore().startRegistration({
      preAuthSessionId: session.id,
      email,
      emailHash: emailHash(email),
      passwordVerifier: await hashPassword(body.password),
      displayName: body.displayName,
      verificationTokenHash: sha256(token),
    });

    return {
      accepted: true,
      verificationRequired: true,
      ...(this.config.production || !accepted ? {} : { verificationToken: token }),
    };
  }

  @Post('verify-email')
  @UseGuards(SessionGuard, CsrfGuard)
  @ApiOperation({ summary: 'Verify first-party email and activate the account' })
  async verifyEmail(
    @Req() request: RequestWithSession,
    @Res({ passthrough: true }) response: Response,
    @Body() body: LocalVerifyDto,
  ) {
    const session = requireSession(request);
    if (session.user_id) throw new ForbiddenException('already signed in');
    try {
      const login = await this.credentialStore().completeRegistration(session.id, body.token);
      response.setHeader('set-cookie', sessionCookie(login.token, this.config));
      return { outcome: 'signed-in' as const, csrfToken: login.csrfToken, consentCurrent: true };
    } catch {
      throw new UnauthorizedException('verification failed');
    }
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
      const login = await this.credentialStore().completeLogin(session.id, credential.user_id, hash);
      response.setHeader('set-cookie', sessionCookie(login.token, this.config));
      const consentCurrent = await this.sessionStore().hasCurrentUserConsent(login.session_id);
      return { outcome: 'signed-in' as const, csrfToken: login.csrfToken, consentCurrent };
    } catch {
      throw new UnauthorizedException('invalid credentials');
    }
  }
}
