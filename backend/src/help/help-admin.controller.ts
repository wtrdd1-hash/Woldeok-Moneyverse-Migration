import {
  BadRequestException, Body, ConflictException, Controller, ForbiddenException, Get, Header,
  Inject, NotFoundException, Param, ParseUUIDPipe, Post, Req, ServiceUnavailableException, UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { requireSession, requireUserId, type RequestWithSession } from '../auth/session.context';
import { isRoleRefusal, pgErrorCode } from '../core/pg-error';
import { HelpRepository } from './help.repository';

class CreateHelpDraftDto {
  @IsUUID() readonly idempotencyKey!: string;
  @IsIn(['ko','en']) readonly locale!: string;
  @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) @MaxLength(100) readonly slug!: string;
  @IsIn(['account','wallet','shop','community','support']) readonly category!: string;
  @IsString() @MinLength(1) @MaxLength(120) readonly title!: string;
  @IsString() @MinLength(1) @MaxLength(240) readonly summary!: string;
  @IsString() @MinLength(1) @MaxLength(12000) readonly body!: string;
  @IsString() @MaxLength(2000) readonly sourceUrl!: string;
  @Matches(/^[a-f0-9]{64}$/) readonly sourceSha256!: string;
  @IsISO8601() readonly reviewedUntil!: string;
}
class ChangeHelpStateDto {
  @IsUUID() readonly idempotencyKey!: string;
  @Matches(/^[1-9][0-9]{0,18}$/) readonly expectedVersion!: string;
}

@ApiTags('admin')
@Controller('admin/help')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard)
export class AdminHelpController {
  constructor(@Inject(HelpRepository) private readonly help: HelpRepository | null) {}
  private repo(): HelpRepository {
    if (process.env.VERIFIED_HELP_CENTER_V1 !== 'true' || !this.help) {
      throw new ServiceUnavailableException('verified help center is unavailable');
    }
    return this.help;
  }
  private requireRole(req: RequestWithSession, role: 'operator'|'approver') {
    if (!req.adminRoles?.includes(role)) throw new ForbiddenException('help administrator role required');
    return [requireUserId(req), requireSession(req).id] as const;
  }
  private async execute<T>(operation: () => Promise<T>): Promise<T> {
    try { return await operation(); }
    catch (error) {
      const code = pgErrorCode(error);
      if (isRoleRefusal(error)) throw new ForbiddenException('help administrator role required');
      if (code === '23505' || code === '40001') throw new ConflictException('help article version or idempotency conflict');
      if (code === '22023') throw new BadRequestException('invalid or expired help evidence');
      if (code === 'P0002') throw new NotFoundException('help article not found');
      throw error;
    }
  }
  @Get('articles') @Header('Cache-Control','private, no-store')
  @ApiOperation({ summary: 'Current private help review queue' })
  async queue(@Req() req: RequestWithSession) {
    const repo = this.repo();
    if (!req.adminRoles?.some(role => role === 'operator' || role === 'approver')) throw new ForbiddenException();
    const rows = await this.execute(() => repo.adminQueue(requireUserId(req), requireSession(req).id));
    const canApprove = req.adminRoles?.includes('approver') === true;
    return {
      canDraft: req.adminRoles?.includes('operator') === true,
      articles: rows.map(row => {
        const evidenceExpired = !Number.isFinite(new Date(row.reviewed_until).getTime()) ||
          new Date(row.reviewed_until).getTime() <= Date.now();
        return { ...row, evidenceExpired,
          canApprove: canApprove && row.state === 'draft' && !evidenceExpired && row.author_id !== requireUserId(req),
          canRetract: canApprove && row.state === 'published' };
      }),
    };
  }
  @Post('articles') @UseGuards(CsrfGuard) @Header('Cache-Control','private, no-store')
  @ApiOperation({ summary: 'Create an unpublished evidence-backed help draft' })
  async create(@Req() req: RequestWithSession, @Body() body: CreateHelpDraftDto) {
    const repo = this.repo();
    const [actor, session] = this.requireRole(req,'operator');
    const id = await this.execute(() => repo.adminCreate(actor,session,body.idempotencyKey,body));
    if (!id) throw new ServiceUnavailableException('draft creation unverified');
    return { articleId: id, state: 'draft' };
  }
  @Post('articles/:id/publish') @UseGuards(CsrfGuard) @Header('Cache-Control','private, no-store')
  @ApiOperation({ summary: 'Independently approve a help revision for publication' })
  async publish(@Req() req: RequestWithSession, @Param('id',ParseUUIDPipe) id: string, @Body() body: ChangeHelpStateDto) {
    const repo = this.repo();
    const [actor,session] = this.requireRole(req,'approver');
    const published = await this.execute(() => repo.adminPublish(actor,session,body.idempotencyKey,id,body.expectedVersion));
    if (!published) throw new ServiceUnavailableException('publication unverified');
    return { articleId: published, state: 'published' };
  }
  @Post('articles/:id/retract') @UseGuards(CsrfGuard) @Header('Cache-Control','private, no-store')
  @ApiOperation({ summary: 'Withdraw a public help article at the database boundary' })
  async retract(@Req() req: RequestWithSession, @Param('id',ParseUUIDPipe) id: string, @Body() body: ChangeHelpStateDto) {
    const repo = this.repo();
    const [actor,session] = this.requireRole(req,'approver');
    const retracted = await this.execute(() => repo.adminRetract(actor,session,body.idempotencyKey,id,body.expectedVersion));
    if (!retracted) throw new ServiceUnavailableException('retraction unverified');
    return { articleId: retracted, state: 'retracted' };
  }
}
