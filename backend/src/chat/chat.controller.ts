import {
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
  targetUserId!: string;
}

export class SendMessageDto {
  @ApiProperty({ minLength: 1, maxLength: 2000 })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body!: string;
}

export class ConversationListQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class MessageListQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: '읽음 처리 여부' })
  @IsOptional()
  @IsBoolean()
  markAsRead?: boolean;
}

@ApiTags('chat')
@Controller('chat')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class ChatController {
  constructor(@Inject(ChatService) private readonly chatService: ChatService) {}

  @Post('conversations')
  @ApiOperation({ summary: '1:1 대화방 생성 또는 기존 대화방 반환' })
  async openConversation(@Req() req: RequestWithSession, @Body() dto: OpenConversationDto) {
    return this.chatService.openConversation(requireUserId(req), dto.targetUserId);
  }

  @Get('conversations')
  @ApiOperation({ summary: '내 대화방 목록' })
  async listConversations(@Req() req: RequestWithSession, @Query() query: ConversationListQueryDto) {
    return this.chatService.listConversations(requireUserId(req), query.limit ?? 20);
  }

  @Get('conversations/:conversationId/messages')
  @ApiOperation({ summary: '대화방 메시지 목록' })
  async listMessages(
    @Req() req: RequestWithSession,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Query() query: MessageListQueryDto,
  ) {
    return this.chatService.listMessages(requireUserId(req), conversationId, query.limit ?? 50, query.markAsRead ?? true);
  }

  @Post('conversations/:conversationId/messages')
  @ApiOperation({ summary: '대화 메시지 전송' })
  async sendMessage(
    @Req() req: RequestWithSession,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(requireUserId(req), conversationId, dto.body, randomUUID());
  }
}
