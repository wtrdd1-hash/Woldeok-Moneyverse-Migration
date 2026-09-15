import {
  Body, Controller, Get, Inject, NotFoundException, Param, ParseUUIDPipe, Post,
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

  @Get('threads') @ApiOperation({ summary: 'My administrator support conversations' })
  async threads(@Req() req: RequestWithSession) { return { threads: await this.repo().myThreads(requireUserId(req)) }; }

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
