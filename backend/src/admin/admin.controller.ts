import {
  BadRequestException,
  Body,
  Controller,
  Get,
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
import {
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { isExpectedCommandFailure } from '../core/pg-error';
import { AdminInputError } from './admin.repository';
import { AdminService } from './admin.service';

export class CreateApprovalDto {
  @ApiProperty({ maxLength: 64, description: 'Action key the approval policy names' })
  @IsString()
  @MaxLength(64)
  readonly action!: string;

  /**
   * Passed through untouched. Its shape belongs to the action, and
   * `admin_create_approval_request` is what validates it against the policy —
   * enumerating shapes here would put a second, weaker authority in front of
   * the one that decides.
   */
  @ApiProperty({ type: Object, description: 'Action-specific payload' })
  @IsObject()
  readonly payload!: Record<string, unknown>;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  readonly idempotencyKey?: string;
}

export class ApprovalDecisionDto {
  @ApiProperty({ enum: ['approve', 'reject'] })
  @IsIn(['approve', 'reject'])
  readonly decision!: 'approve' | 'reject';

  @ApiProperty({ required: false, maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  readonly reason?: string;
}

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
 * non-administrator may see: the approval queue, the audit log and the member
 * list all describe moderation activity.
 *
 * The database functions behind these check the caller's role again. That
 * duplication is deliberate — the two-person approval rule in particular is
 * enforced by `admin_decide_approval_request`, which refuses a requester
 * deciding their own request no matter what this layer believes.
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
  @ApiOperation({ summary: 'Pending and recent approval requests' })
  async approvals(@Req() request: RequestWithSession) {
    return { approvals: await this.service().approvalRequests(requireUserId(request)) };
  }

  @Post('approvals')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Raise an approval request' })
  approve(@Req() request: RequestWithSession, @Body() body: CreateApprovalDto) {
    return this.guarded(
      () =>
        this.service().requestApproval({
          actorUserId: requireUserId(request),
          action: body.action,
          payload: body.payload,
          ...(body.idempotencyKey === undefined ? {} : { idempotencyKey: body.idempotencyKey }),
        }),
      'invalid approval request',
    );
  }

  @Post('approvals/:id/decisions')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Approve or reject a request raised by someone else' })
  decide(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) approvalRequestId: string,
    @Body() body: ApprovalDecisionDto,
  ) {
    return this.guarded(
      () =>
        this.service().decideApproval({
          actorUserId: requireUserId(request),
          approvalRequestId,
          decision: body.decision,
          reason: body.reason ?? null,
        }),
      'invalid approval decision',
    );
  }

  @Get('audit-events')
  @ApiOperation({ summary: 'Recent audit trail entries' })
  async auditEvents(@Req() request: RequestWithSession) {
    return { events: await this.service().recentAuditEvents(requireUserId(request)) };
  }

  @Get('discord-outbox-events')
  @ApiOperation({ summary: 'Recent Discord outbox deliveries' })
  async discordOutboxEvents(@Req() request: RequestWithSession) {
    return { events: await this.service().recentDiscordOutboxEvents(requireUserId(request)) };
  }

  @Get('users')
  @ApiOperation({ summary: 'Members and their status' })
  async users(@Req() request: RequestWithSession) {
    return { users: await this.service().users(requireUserId(request)) };
  }

  @Put('users/:id/restriction')
  @UseGuards(CsrfGuard)
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
