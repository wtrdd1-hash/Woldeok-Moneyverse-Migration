import {
  BadRequestException, Body, ConflictException, Controller, Header, Inject, NotFoundException,
  Param, Post, Req, ServiceUnavailableException, UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsIn, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { requireUserId, type RequestWithSession } from '../auth/session.context';
import { SupportRepository } from '../support/support.repository';
import { HelpRepository } from './help.repository';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REASONS = ['outdated', 'incorrect', 'unclear'] as const;

class HelpReportDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() readonly idempotencyKey!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() readonly publishedRevisionId!: string;
  @ApiProperty({ enum: REASONS }) @IsIn(REASONS) readonly reason!: string;
  @ApiProperty({ minLength: 10, maxLength: 600 }) @IsString() @MinLength(10) @MaxLength(600) readonly details!: string;
}

@ApiTags('help')
@Controller('help')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class HelpReportController {
  constructor(
    @Inject(HelpRepository) private readonly help: HelpRepository | null,
    @Inject(SupportRepository) private readonly support: SupportRepository | null,
  ) {}

  @Post('articles/:locale/:slug/report')
  @UseGuards(CsrfGuard)
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Robots-Tag', 'noindex')
  @ApiOperation({ summary: 'Report a problem with an exact currently approved help revision' })
  async report(@Req() req: RequestWithSession, @Param('locale') locale: string,
    @Param('slug') slug: string, @Body() body: HelpReportDto) {
    if (process.env.VERIFIED_HELP_CENTER_V1 !== 'true' ||
      process.env.VERIFIED_HELP_REPORT_V1 !== 'true' || !this.help || !this.support) {
      throw new ServiceUnavailableException('verified help report is unavailable');
    }
    if (!['ko', 'en'].includes(locale) || !SLUG.test(slug) || slug.length > 100 ||
      !body || typeof body.idempotencyKey !== 'string' || !UUID.test(body.idempotencyKey) ||
      typeof body.publishedRevisionId !== 'string' || !UUID.test(body.publishedRevisionId) ||
      !REASONS.includes(body.reason as typeof REASONS[number]) ||
      typeof body.details !== 'string' || body.details.trim().length < 10 ||
      Array.from(body.details).length > 600 || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(body.details)) {
      throw new BadRequestException('invalid help report parameters');
    }

    // The published-only SQL function also checks independent review and expiry.
    const article = await this.help.article(locale, slug);
    if (!article) throw new NotFoundException('help article not found');
    if (article.published_revision_id !== body.publishedRevisionId) {
      throw new ConflictException('help article edition changed; reload before reporting');
    }

    const actor = requireUserId(req);
    const details = body.details.trim();
    const subject = `Verified help: ${locale}/${slug}`;
    // JSON encoding prevents an untrusted multiline comment from spoofing trusted fields.
    const reportBody = JSON.stringify({
      kind: 'verified_help_issue', locale, slug,
      publishedRevisionId: article.published_revision_id, reason: body.reason, details,
    });
    const thread = await this.support.createThread(actor, body.idempotencyKey, subject, reportBody);
    if (!thread || !UUID.test(thread.thread_id) || !['open', 'waiting_user', 'resolved'].includes(thread.status)) {
      throw new ServiceUnavailableException('help report receipt unavailable');
    }
    // The legacy support function replays by key without checking the payload.
    // Verify its original persisted message before acknowledging a replay.
    const messages = await this.support.messages(actor, thread.thread_id, 1);
    if (messages[0]?.sender_kind !== 'user' || messages[0].body !== reportBody) {
      throw new ConflictException('help report idempotency conflict');
    }
    return { threadId: thread.thread_id, status: thread.status, verified: true };
  }
}
