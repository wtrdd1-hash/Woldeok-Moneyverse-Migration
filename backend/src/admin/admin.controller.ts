import {
  BadRequestException,
  Body,
  Controller,
  Get,
  GoneException,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsString, MaxLength } from 'class-validator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { SecondFactorGuard } from '../auth/guards/second-factor.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { isExpectedCommandFailure } from '../core/pg-error';
import { AdminInputError } from './admin.repository';
import { AdminService } from './admin.service';

/**
 * What the three approval routes answer. Named so the sentence is written
 * once and the three handlers cannot drift apart.
 */
const RETIRED = 'two-person approval was retired; the superadmin acts alone';

export class UserRestrictionDto {
  @ApiProperty()
  @IsBoolean()
  readonly restricted!: boolean;

  @ApiProperty({ maxLength: 2000 })
  @IsString()
  @MaxLength(2000)
  readonly reason!: string;
}

/**
 * Every route here carries the full guard chain, AdminGuard included, and
 * every write carries CsrfGuard on top. There is no read here that a
 * non-administrator may see: the audit log and the member list both describe
 * moderation activity.
 *
 * `AdminSessionGuard` is on each route but `me`, which is the probe the
 * console's front door uses to find out whether the caller is an
 * administrator at all — gating it on an open console session would make the
 * only way in depend on already being in.
 *
 * The database functions behind these check the caller's role again. That
 * duplication is deliberate: nothing this layer believes can widen what
 * `admin_set_user_restriction` or `admin_recent_audit_events` will do.
 *
 * THE APPROVAL QUEUE IS GONE. Two-person approval was retired in migrations
 * 057-058 and the superadmin acts alone, backed by a second authentication
 * factor rather than by a second person. The three routes stay mounted and
 * answer 410 — they are in `packages/contract/src/route-map.ts`, where a
 * route the original served cannot quietly disappear, and 410 is the answer
 * that says the feature was withdrawn rather than that the path was mistyped.
 * `admin_create_approval_request` and `admin_decide_approval_request` raise
 * 55000 for the same reason, one layer down.
 */
@ApiTags('admin')
@Controller('admin')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard)
export class AdminController {
  constructor(@Inject(AdminService) private readonly admin: AdminService | null) {}

  private service(): AdminService {
    if (!this.admin) throw new ServiceUnavailableException('admin service is unavailable');
    return this.admin;
  }

  private async guarded<T>(work: () => Promise<T>, message: string): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (error instanceof AdminInputError) throw new BadRequestException(error.message);
      if (isExpectedCommandFailure(error)) throw new BadRequestException(message);
      throw error;
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'Roles held by the caller' })
  async me(@Req() request: RequestWithSession) {
    return { roles: request.adminRoles ?? [] };
  }

  @Get('approvals')
  @ApiOperation({ summary: 'Withdrawn: two-person approval was retired' })
  approvals() {
    throw new GoneException(RETIRED);
  }

  @Post('approvals')
  @ApiOperation({ summary: 'Withdrawn: two-person approval was retired' })
  approve() {
    throw new GoneException(RETIRED);
  }

  @Post('approvals/:id/decisions')
  @ApiOperation({ summary: 'Withdrawn: two-person approval was retired' })
  decide(@Param('id', ParseUUIDPipe) _approvalRequestId: string) {
    throw new GoneException(RETIRED);
  }

  @Get('audit-events')
  @UseGuards(AdminSessionGuard)
  @ApiOperation({ summary: 'Recent audit trail entries' })
  async auditEvents(@Req() request: RequestWithSession) {
    return { events: await this.service().recentAuditEvents(requireUserId(request)) };
  }

  @Get('discord-outbox-events')
  @UseGuards(AdminSessionGuard)
  @ApiOperation({ summary: 'Recent Discord outbox deliveries' })
  async discordOutboxEvents(@Req() request: RequestWithSession) {
    return { events: await this.service().recentDiscordOutboxEvents(requireUserId(request)) };
  }

  @Get('users')
  @UseGuards(AdminSessionGuard)
  @ApiOperation({ summary: 'Members and their status' })
  async users(@Req() request: RequestWithSession) {
    return { users: await this.service().users(requireUserId(request)) };
  }

  @Put('users/:id/restriction')
  @UseGuards(AdminSessionGuard, CsrfGuard, ReauthGuard, SecondFactorGuard)
  @ApiOperation({ summary: 'Restrict or unrestrict a member' })
  restrict(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() body: UserRestrictionDto,
  ) {
    return this.guarded(
      () =>
        this.service().setUserRestriction({
          actorUserId: requireUserId(request),
          userId,
          ...body,
        }),
      'invalid restriction request',
    );
  }
}
