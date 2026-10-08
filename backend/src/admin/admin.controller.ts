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
import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { randomUUID } from 'node:crypto';
import { ChatService } from '../chat/chat.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { isExpectedCommandFailure } from '../core/pg-error';
import { contextOf } from '../core/request-context';
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

export class SendAdminDirectMessageDto {
  @ApiProperty({ format: 'uuid', description: '수신 대상 회원 UUID' })
  @IsUUID()
  readonly recipientUserId!: string;

  @ApiProperty({ description: '공식 쪽지 제목 (선택)', maxLength: 100, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly title?: string;

  @ApiProperty({ description: '공식 쪽지 본문', minLength: 1, maxLength: 2000 })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  readonly body!: string;
}

export class BroadcastAdminMessageDto {
  @ApiProperty({ description: '전체 공지 제목', minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  readonly title!: string;

  @ApiProperty({ description: '전체 공지 본문', minLength: 1, maxLength: 2000 })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  readonly body!: string;
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
  constructor(
    @Inject(AdminService) private readonly admin: AdminService | null,
    @Inject(ChatService) private readonly chat: ChatService | null,
  ) {}

  private service(): AdminService {
    if (!this.admin) throw new ServiceUnavailableException('admin service is unavailable');
    return this.admin;
  }

  private chatService(): ChatService {
    if (!this.chat) throw new ServiceUnavailableException('chat service is unavailable');
    return this.chat;
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

  @Get('users/:id/portfolio')
  @UseGuards(AdminSessionGuard)
  @ApiOperation({ summary: 'Detailed user asset portfolio' })
  async userPortfolio(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) userId: string,
  ) {
    return { portfolio: await this.service().userPortfolio(requireUserId(request), userId) };
  }

  @Put('users/:id/restriction')
  @UseGuards(AdminSessionGuard, CsrfGuard, ReauthGuard)
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
          requestId: contextOf(request)?.requestId ?? null,
          ...body,
        }),
      'invalid restriction request',
    );
  }

  @Post('messages/send')
  @UseGuards(AdminSessionGuard, CsrfGuard)
  @ApiOperation({ summary: '관리자가 특정 회원에게 공식 쪽지 발송' })
  async sendDirectMessage(
    @Req() request: RequestWithSession,
    @Body() dto: SendAdminDirectMessageDto,
  ) {
    const actorUserId = requireUserId(request);
    const prefix = dto.title?.trim()
      ? `📢 [운영팀 공식 공지: ${dto.title.trim()}]\n\n`
      : `📢 [운영팀 공식 메시지]\n\n`;
    const fullBody = `${prefix}${dto.body.trim()}`;

    // 1. 관리자와 대상 유저 간의 1:1 대화방 개설 또는 기존 대화방 조회
    const conversation = await this.chatService().openConversation(actorUserId, dto.recipientUserId);

    // 2. 메시지 발송
    const key = randomUUID();
    const sent = await this.chatService().sendMessage(actorUserId, conversation.conversation_id, key, fullBody);

    // 3. 감사 로그 기록
    await this.service().recordAudit({
      actorUserId,
      action: 'admin_send_direct_message',
      targetId: dto.recipientUserId,
      requestId: contextOf(request)?.requestId ?? null,
      metadata: {
        conversationId: conversation.conversation_id,
        messageId: sent.message_id,
        title: dto.title ?? null,
      },
    });

    return {
      success: true,
      conversationId: conversation.conversation_id,
      messageId: sent.message_id,
      sequence: sent.sequence,
      createdAt: sent.created_at,
    };
  }

  @Post('messages/broadcast')
  @UseGuards(AdminSessionGuard, CsrfGuard, ReauthGuard)
  @ApiOperation({ summary: '관리자가 전체 회원에게 공식 공지 쪽지 일괄 발송' })
  async broadcastMessage(
    @Req() request: RequestWithSession,
    @Body() dto: BroadcastAdminMessageDto,
  ) {
    const actorUserId = requireUserId(request);
    const users = (await this.service().users(actorUserId, { limit: 100 })) as Array<{ user_id: string }>;

    const prefix = `📢 [전체 공식 공지: ${dto.title.trim()}]\n\n`;
    const fullBody = `${prefix}${dto.body.trim()}`;

    let sentCount = 0;
    for (const target of users) {
      if (target.user_id === actorUserId) continue;
      try {
        const conv = await this.chatService().openConversation(actorUserId, target.user_id);
        await this.chatService().sendMessage(actorUserId, conv.conversation_id, randomUUID(), fullBody);
        sentCount++;
      } catch {
        // Continue delivering to remaining users even if one fails
      }
    }

    await this.service().recordAudit({
      actorUserId,
      action: 'admin_broadcast_message',
      requestId: contextOf(request)?.requestId ?? null,
      metadata: {
        title: dto.title,
        recipientCount: sentCount,
      },
    });

    return {
      success: true,
      sentCount,
      totalUsers: users.length - 1,
    };
  }
}
