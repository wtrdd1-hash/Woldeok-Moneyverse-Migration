import { BadRequestException, Body, ConflictException, Controller, ForbiddenException, Inject, Param, ParseUUIDPipe, Post, Req, ServiceUnavailableException, UseGuards } from '@nestjs/common';
import { IsString, IsUUID, MaxLength, MinLength, Matches } from 'class-validator';
import { AuthenticatedGuard } from './auth/guards/authenticated.guard';
import { ConsentGuard } from './auth/guards/consent.guard';
import { CsrfGuard } from './auth/guards/csrf.guard';
import { SessionGuard } from './auth/guards/session.guard';
import type { RequestWithSession } from './auth/session.context';
import { requireUserId } from './auth/session.context';
import { isAuthorizationFailure, isExpectedCommandFailure } from './core/pg-error';
import { ChatRepository } from './chat.repository';

class SendChatDto {
  @IsUUID() idempotencyKey!: string;
  @IsString() @MinLength(1) @MaxLength(2000) @Matches(/^[^\u0000-\u001f\u007f-\u009f]*$/u) body!: string;
}
class ReadChatDto { @IsString() @Matches(/^\d+$/) sequence!: string }

@Controller('chat')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
export class ChatController {
  constructor(@Inject(ChatRepository) private readonly chats: ChatRepository | null) {}
  private repo() { if (!this.chats) throw new ServiceUnavailableException('chat is unavailable'); return this.chats; }
  private async guarded<T>(work: () => Promise<T>): Promise<T> {
    try { return await work(); }
    catch (error: unknown) {
      if (isAuthorizationFailure(error)) throw new ForbiddenException('chat access denied');
      if (isExpectedCommandFailure(error)) throw new ConflictException('chat command conflicts with current state');
      throw error;
    }
  }
  @Post('peers/:peerId')
  async open(@Req() req: RequestWithSession, @Param('peerId', ParseUUIDPipe) peer: string) {
    return this.guarded(() => this.repo().open(requireUserId(req), peer));
  }
  @Post(':conversationId/messages')
  async send(@Req() req: RequestWithSession, @Param('conversationId', ParseUUIDPipe) conversation: string, @Body() body: SendChatDto) {
    return this.guarded(() => this.repo().send(requireUserId(req), conversation, body.idempotencyKey, body.body));
  }
  @Post(':conversationId/read')
  async read(@Req() req: RequestWithSession, @Param('conversationId', ParseUUIDPipe) conversation: string, @Body() body: ReadChatDto) {
    if (BigInt(body.sequence) > 9223372036854775807n) throw new BadRequestException('sequence is out of range');
    const lastReadSequence = await this.guarded(() => this.repo().read(requireUserId(req), conversation, body.sequence));
    return { lastReadSequence };
  }
}
