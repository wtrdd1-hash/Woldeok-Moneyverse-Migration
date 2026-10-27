import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsDefined, IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { randomUUID } from 'node:crypto';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { ChatService } from './chat.service';
import { parsePgChatSequence } from './chat-sequence';

export class OpenConversationDto {
  @ApiProperty({ format: 'uuid', description: '상대방 회원 ID' })
  @IsUUID()
  readonly peerUserId!: string;
}

export class SendMessageDto {
  @ApiProperty({ description: '메시지 본문', minLength: 1, maxLength: 2000 })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  readonly body!: string;

  @ApiPropertyOptional({ format: 'uuid', description: '클라이언트 멱등성 키 (미제공시 서버 자동생성)' })
  @IsOptional()
  @IsUUID()
  readonly idempotencyKey?: string;
}

export class MarkReadDto {
  @ApiProperty({ description: '읽은 마지막 메시지 시퀀스 (정확한 64-bit 정수 문자열, 구형 앱의 안전한 정수도 허용)', oneOf: [{ type: 'string' }, { type: 'integer' }] })
  @IsDefined()
  readonly sequence!: string | number;
}

export class ArchiveConversationDto {
  @ApiProperty({ description: '대화방 보관 여부' })
  @IsBoolean()
  readonly archived!: boolean;
}

export class MuteConversationDto {
  @ApiProperty({ description: '대화방 알림 음소거 여부' })
  @IsBoolean()
  readonly muted!: boolean;
}

export class ReportConversationDto {
  @ApiProperty({
    description: '신고 사유 코드',
    enum: ['spam_promotional', 'fraud_scam', 'abuse_harassment', 'other'],
  })
  @IsIn(['spam_promotional', 'fraud_scam', 'abuse_harassment', 'other'])
  readonly reason!: string;

  @ApiProperty({ description: '구체적 신고 상세 사유', minLength: 2, maxLength: 2000 })
  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  readonly details!: string;
}

/**
 * Chat pagination limits must be exact decimal query values, not parseInt prefixes.
 * Never silently broaden a member-scoped query after malformed input.
 */
function parseChatCursor(raw: unknown, allowZero: boolean): string {
  try {
    return parsePgChatSequence(raw, allowZero);
  } catch {
    throw new BadRequestException('chat sequence must be a canonical PostgreSQL bigint');
  }
}

function parseChatListLimit(raw: unknown, defaultLimit: number, maxLimit: number): number {
  if (raw === undefined) return defaultLimit;
  if (typeof raw !== 'string' || !/^[1-9][0-9]*$/.test(raw)) {
    throw new BadRequestException(`limit must be a decimal integer between 1 and ${maxLimit}`);
  }
  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed) || parsed > maxLimit) {
    throw new BadRequestException(`limit must be a decimal integer between 1 and ${maxLimit}`);
  }
  return parsed;
}

@ApiTags('chat')
@Controller('chat')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class ChatController {
  constructor(@Inject(ChatService) private readonly chat: ChatService) {}

  @ApiOperation({ summary: '1:1 대화방 생성 또는 기존 대화방 조회' })
  @Post('conversations')
  async openConversation(@Req() req: RequestWithSession, @Body() dto: OpenConversationDto) {
    const actorUserId = requireUserId(req);
    return this.chat.openConversation(actorUserId, dto.peerUserId);
  }

  @ApiOperation({ summary: '참여 중인 1:1 대화방 목록 조회' })
  @Get('conversations')
  async listConversations(
    @Req() req: RequestWithSession,
    @Query('limit') limit?: string,
  ) {
    const actorUserId = requireUserId(req);
    const parsedLimit = parseChatListLimit(limit, 50, 100);
    const conversations = await this.chat.listConversations(actorUserId, parsedLimit);
    const totalUnread = await this.chat.totalUnreadCount(actorUserId);
    return { conversations, totalUnread };
  }

  @ApiOperation({ summary: '안 읽은 전체 쪽지 개수 조회' })
  @Get('unread-count')
  async unreadCount(@Req() req: RequestWithSession) {
    const actorUserId = requireUserId(req);
    const totalUnread = await this.chat.totalUnreadCount(actorUserId);
    return { totalUnread };
  }

  @ApiOperation({ summary: '1:1 쪽지 상대방 회원 닉네임 검색' })
  @Get('search-users')
  async searchUsers(
    @Req() req: RequestWithSession,
    @Query('query') query?: string,
    @Query('limit') limit?: string,
  ) {
    const actorUserId = requireUserId(req);
    const parsedLimit = parseChatListLimit(limit, 10, 20);
    const users = await this.chat.searchActiveUsers(actorUserId, query ?? '', parsedLimit);
    return { users };
  }

  @ApiOperation({ summary: '대화방 메시지 이력 조회' })
  @Get('conversations/:id/messages')
  async listMessages(
    @Req() req: RequestWithSession,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Query('limit') limit?: string,
    @Query('beforeSequence') beforeSequence?: string,
  ) {
    const actorUserId = requireUserId(req);
    const parsedLimit = parseChatListLimit(limit, 50, 100);
    const parsedBefore = beforeSequence === undefined ? undefined : parseChatCursor(beforeSequence, false);
    const messages = await this.chat.listMessages(actorUserId, conversationId, parsedLimit, parsedBefore);
    return { messages };
  }

  @ApiOperation({ summary: '네트워크 재연결 시 누락 메시지 델타 동기화' })
  @Get('conversations/:id/sync')
  async syncMessages(
    @Req() req: RequestWithSession,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Query('sinceSequence') sinceSequence?: string,
    @Query('limit') limit?: string,
  ) {
    const actorUserId = requireUserId(req);
    const parsedSince = sinceSequence === undefined ? '0' : parseChatCursor(sinceSequence, true);
    const parsedLimit = parseChatListLimit(limit, 100, 200);
    const messages = await this.chat.syncMessages(actorUserId, conversationId, parsedSince, parsedLimit);
    return { messages };
  }

  @ApiOperation({ summary: '대화방에 1:1 쪽지 메시지 전송' })
  @Post('conversations/:id/messages')
  async sendMessage(
    @Req() req: RequestWithSession,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    const actorUserId = requireUserId(req);
    const key = dto.idempotencyKey || randomUUID();
    return this.chat.sendMessage(actorUserId, conversationId, key, dto.body);
  }

  @ApiOperation({ summary: '대화방 메시지 읽음 처리' })
  @Post('conversations/:id/read')
  async markAsRead(
    @Req() req: RequestWithSession,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Body() dto: MarkReadDto,
  ) {
    const actorUserId = requireUserId(req);
    return this.chat.markAsRead(actorUserId, conversationId, parseChatCursor(dto.sequence, true));
  }

  @ApiOperation({ summary: '대화방 보관 또는 보관 해제' })
  @Post('conversations/:id/archive')
  async archiveConversation(
    @Req() req: RequestWithSession,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Body() dto: ArchiveConversationDto,
  ) {
    const actorUserId = requireUserId(req);
    const ok = await this.chat.archiveConversation(actorUserId, conversationId, dto.archived);
    return { ok };
  }

  @ApiOperation({ summary: '대화방 알림 음소거 또는 해제' })
  @Post('conversations/:id/mute')
  async muteConversation(
    @Req() req: RequestWithSession,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Body() dto: MuteConversationDto,
  ) {
    const actorUserId = requireUserId(req);
    const ok = await this.chat.muteConversation(actorUserId, conversationId, dto.muted);
    return { ok, muted: dto.muted };
  }

  @ApiOperation({ summary: '특정 회원 1:1 쪽지 차단' })
  @Post('users/:id/block')
  async blockUser(
    @Req() req: RequestWithSession,
    @Param('id', ParseUUIDPipe) targetUserId: string,
  ) {
    const actorUserId = requireUserId(req);
    const ok = await this.chat.blockUser(actorUserId, targetUserId);
    return { ok, blocked: true };
  }

  @ApiOperation({ summary: '특정 회원 1:1 쪽지 차단 해제' })
  @Delete('users/:id/block')
  async unblockUser(
    @Req() req: RequestWithSession,
    @Param('id', ParseUUIDPipe) targetUserId: string,
  ) {
    const actorUserId = requireUserId(req);
    const ok = await this.chat.unblockUser(actorUserId, targetUserId);
    return { ok, blocked: false };
  }

  @ApiOperation({ summary: '부적절한 대화 내용 신고 및 증거 스냅샷 접수' })
  @Post('conversations/:id/report')
  async reportConversation(
    @Req() req: RequestWithSession,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Body() dto: ReportConversationDto,
  ) {
    const actorUserId = requireUserId(req);
    const result = await this.chat.reportConversation(actorUserId, conversationId, dto.reason, dto.details);
    return { ok: true, reportId: result.reportId };
  }
}
