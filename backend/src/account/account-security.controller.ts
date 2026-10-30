import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Header,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireSession, requireUserId } from '../auth/session.context';
import { AccountSecurityRepository } from './account-security.repository';
import type { SecurityEventCategory } from './account-security.repository';

@ApiTags('account')
@Controller('account/security')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class AccountSecurityController {
  constructor(
    @Inject(AccountSecurityRepository)
    private readonly security: AccountSecurityRepository | null,
  ) {}

  private repository(): AccountSecurityRepository {
    if (!this.security) throw new ServiceUnavailableException('account security is unavailable');
    return this.security;
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Active sessions belonging to the caller' })
  async sessions(@Req() request: RequestWithSession) {
    return {
      sessions: await this.repository().activeSessions(
        requireUserId(request),
        requireSession(request).id,
      ),
    };
  }

  @Get('events')
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Robots-Tag', 'noindex')
  @ApiQuery({ name: 'category', required: false, enum: ['all', 'login', 'settings'] })
  @ApiOperation({
    summary: 'Recent owner-only security events, optionally filtered within the latest 20',
  })
  async events(@Req() request: RequestWithSession, @Query('category') category?: unknown) {
    if (
      category !== undefined &&
      (typeof category !== 'string' || !['all', 'login', 'settings'].includes(category))
    ) {
      throw new BadRequestException('invalid security event category');
    }
    return {
      events: await this.repository().recentEvents(
        requireUserId(request),
        (category ?? 'all') as SecurityEventCategory,
      ),
    };
  }

  @Delete('sessions/:id')
  @UseGuards(CsrfGuard, ReauthGuard)
  @ApiOperation({ summary: 'Revoke one other active session belonging to the caller' })
  async revokeSession(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) targetSessionId: string,
  ) {
    return {
      revoked: await this.repository().revokeOtherSession(
        requireUserId(request),
        requireSession(request).id,
        targetSessionId,
      ),
    };
  }

  @Post('sessions/revoke-others')
  @UseGuards(CsrfGuard, ReauthGuard)
  @ApiOperation({ summary: 'Revoke every other active session belonging to the caller' })
  async revokeOtherSessions(@Req() request: RequestWithSession) {
    return {
      revokedSessions: await this.repository().revokeOtherSessions(
        requireUserId(request),
        requireSession(request).id,
      ),
    };
  }
}
