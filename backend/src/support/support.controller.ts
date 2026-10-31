import {
  BadRequestException, Body, Controller, Get, Header, Inject, NotFoundException, Param, ParseUUIDPipe, Post,
  Put, Query, Req, ServiceUnavailableException, UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsIn, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { SupportRepository } from './support.repository';
import { formatSupportTranscriptText } from './support-transcript-text';
import { parseSupportKstRange } from './support-date-range';

class NewThreadDto {
  @ApiProperty({ maxLength: 120 }) @IsString() @MinLength(1) @MaxLength(120) readonly subject!: string;
  @ApiProperty({ maxLength: 2000 }) @IsString() @MinLength(1) @MaxLength(2000) readonly body!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() readonly idempotencyKey!: string;
}
class NewMessageDto {
  @ApiProperty({ maxLength: 2000 }) @IsString() @MinLength(1) @MaxLength(2000) readonly body!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() readonly idempotencyKey!: string;
}
class StatusDto {
  @ApiProperty({ enum: ['open','waiting_user','resolved'] })
  @IsString() @IsIn(['open','waiting_user','resolved']) readonly status!: string;
}

@ApiTags('support')
@Controller('support')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class SupportController {
  constructor(@Inject(SupportRepository) private readonly support: SupportRepository | null) {}
  private repo() { if (!this.support) throw new ServiceUnavailableException('support is unavailable'); return this.support; }

  @Get('threads')
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Robots-Tag', 'noindex')
  @ApiOperation({ summary: 'My recent administrator support conversations, optional status and literal subject search' })
  async threads(@Req() req: RequestWithSession, @Query('status') status?: string, @Query('q') q?: string, @Query('sort') sort?: string, @Query('from') from?: string, @Query('to') to?: string) {
    if (status !== undefined && (typeof status !== 'string' || !['open', 'waiting_user', 'resolved'].includes(status))) {
      throw new BadRequestException('invalid support status');
    }
    if (q !== undefined && (typeof q !== 'string' || q.length > 80 || /[\u0000-\u001f\u007f]/.test(q) || !q.trim())) {
      throw new BadRequestException('invalid support search');
    }
    if (sort !== undefined && sort !== 'oldest') {
      throw new BadRequestException('invalid support order');
    }
    const range = parseSupportKstRange(from, to);
    const actor = requireUserId(req);
    const threads = range
      ? await this.repo().myThreads(actor, status ?? null, q?.trim(), sort === 'oldest' ? 'oldest' : undefined, range)
      : sort === 'oldest'
      ? await this.repo().myThreads(actor, status ?? null, q?.trim(), 'oldest')
      : q === undefined
      ? await this.repo().myThreads(actor, status ?? null)
      : await this.repo().myThreads(actor, status ?? null, q.trim());
    return { threads };
  }

  @Get('threads/summary')
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Robots-Tag', 'noindex')
  @ApiOperation({ summary: 'Status counts among my latest 100 support conversations (not all-time totals)' })
  async summary(@Req() req: RequestWithSession) {
    try {
      return await this.repo().myThreadSummary(requireUserId(req));
    } catch {
      throw new ServiceUnavailableException('support summary is unavailable');
    }
  }

  @Post('threads') @UseGuards(CsrfGuard) @ApiOperation({ summary: 'Open an administrator support conversation' })
  async create(@Req() req: RequestWithSession, @Body() body: NewThreadDto) {
    const thread = await this.repo().createThread(requireUserId(req), body.idempotencyKey, body.subject, body.body);
    if (!thread) throw new ServiceUnavailableException('support thread was not created');
    return { thread };
  }

  @Get('threads/:id/messages') @ApiOperation({ summary: 'Messages in my support conversation' })
  async messages(@Req() req: RequestWithSession, @Param('id', ParseUUIDPipe) id: string) {
    return { messages: await this.repo().messages(requireUserId(req), id) };
  }

  @Get('threads/:id/messages/:messageId')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Verified receipt for an individual support message' })
  async message(
    @Req() req: RequestWithSession,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
  ) {
    const actor = requireUserId(req);
    try {
      const message = await this.repo().exactMessage(actor, id, messageId);
      if (!message) {
        throw new NotFoundException('support message not found');
      }
      return { message };
    } catch (err: unknown) {
      if (err instanceof NotFoundException || err instanceof ServiceUnavailableException || err instanceof BadRequestException) {
        throw err;
      }
      const e = err as { code?: string; message?: string };
      if (e?.code === '42501' && /support thread not available/i.test(e?.message ?? '')) {
        throw new NotFoundException('support thread not found');
      }
      if (e?.code === '42501') {
        throw new ServiceUnavailableException('support permission regression');
      }
      throw err;
    }
  }

  @Get('threads/:id/transcript')
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Robots-Tag', 'noindex')
  @ApiOperation({ summary: 'Export up to 500 messages from my own support conversation' })
  async transcript(@Req() req: RequestWithSession, @Param('id', ParseUUIDPipe) id: string) {
    // support_thread_messages checks thread ownership inside PostgreSQL.
    // A full-history export needs a separate cursor API; do not claim this is complete.
    const messages = await this.repo().messages(requireUserId(req), id, 500);
    return { threadId: id, messages, truncated: messages.length === 500 };
  }

  @Get('threads/:id/transcript/text')
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Robots-Tag', 'noindex')
  @ApiOperation({ summary: 'Downloadable readable text for up to 500 messages in my own support conversation' })
  async transcriptText(@Req() req: RequestWithSession, @Param('id', ParseUUIDPipe) id: string) {
    // The PostgreSQL function checks ownership before returning any message.
    const messages = await this.repo().messages(requireUserId(req), id, 500);
    const truncated = messages.length === 500;
    return { threadId: id, text: formatSupportTranscriptText(messages, truncated), truncated };
  }

  @Post('threads/:id/messages') @UseGuards(CsrfGuard) @ApiOperation({ summary: 'Reply to my support conversation' })
  async reply(@Req() req: RequestWithSession, @Param('id', ParseUUIDPipe) id: string, @Body() body: NewMessageDto) {
    const message = await this.repo().addMessage(requireUserId(req), body.idempotencyKey, id, body.body);
    if (!message) throw new ServiceUnavailableException('support message was not created');
    return { message };
  }
}

@ApiTags('admin')
@Controller('admin/support')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard)
export class AdminSupportController {
  constructor(@Inject(SupportRepository) private readonly support: SupportRepository | null) {}
  private repo() { if (!this.support) throw new ServiceUnavailableException('support is unavailable'); return this.support; }

  @Get('threads') @ApiOperation({ summary: 'Administrator support inbox' })
  async threads(@Req() req: RequestWithSession, @Query('status') status?: string) {
    const safe = status && ['open','waiting_user','resolved'].includes(status) ? status : null;
    return { threads: await this.repo().adminThreads(requireUserId(req), safe) };
  }

  @Get('threads/:id/messages') @ApiOperation({ summary: 'Read a support conversation as administrator' })
  async messages(@Req() req: RequestWithSession, @Param('id', ParseUUIDPipe) id: string) {
    return { messages: await this.repo().adminMessages(requireUserId(req), id) };
  }

  @Post('threads/:id/messages') @UseGuards(CsrfGuard) @ApiOperation({ summary: 'Reply to a member support conversation' })
  async reply(@Req() req: RequestWithSession, @Param('id', ParseUUIDPipe) id: string, @Body() body: NewMessageDto) {
    const message = await this.repo().adminReply(requireUserId(req), body.idempotencyKey, id, body.body);
    if (!message) throw new ServiceUnavailableException('support reply was not created');
    return { message };
  }

  @Put('threads/:id/status') @UseGuards(CsrfGuard) @ApiOperation({ summary: 'Change support conversation status' })
  async status(@Req() req: RequestWithSession, @Param('id', ParseUUIDPipe) id: string, @Body() body: StatusDto) {
    const changed = await this.repo().adminSetStatus(requireUserId(req), id, body.status);
    if (!changed) throw new NotFoundException('support thread not found');
    return { status: body.status };
  }
}
