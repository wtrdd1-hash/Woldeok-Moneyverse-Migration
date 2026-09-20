import {
  BadRequestException,
  Body,
  Controller,
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
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, MinLength } from 'class-validator';
import { randomUUID } from 'node:crypto';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { ChatService } from './chat.service';

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
  @ApiProperty({ description: '읽은 마지막 메시지 시퀀스 번호' })
  @IsInt()
  @Min(0)
  readonly sequence!: number;
}

export class ArchiveConversationDto {
  @ApiProperty({ description: '대화방 보관 여부' })
  @IsBoolean()
  readonly archived!: boolean;
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
    const parsedLimit = limit ? Number.parseInt(limit, 10) : 50;
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

  @ApiOperation({ summary: '대화방 메시지 이력 조회' })
  @Get('conversations/:id/messages')
  async listMessages(
    @Req() req: RequestWithSession,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Query('limit') limit?: string,
    @Query('beforeSequence') beforeSequence?: string,
  ) {
    const actorUserId = requireUserId(req);
    const parsedLimit = limit ? Number.parseInt(limit, 10) : 50;
    const parsedBefore = beforeSequence ? Number.parseInt(beforeSequence, 10) : undefined;
    const messages = await this.chat.listMessages(actorUserId, conversationId, parsedLimit, parsedBefore);
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
    return this.chat.markAsRead(actorUserId, conversationId, dto.sequence);
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
}
