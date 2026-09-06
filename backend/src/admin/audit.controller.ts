import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  IsIn,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import {
  isAuthorizationFailure,
  isExpectedCommandFailure,
  isMalformedInput,
  isRoleRefusal,
} from '../core/pg-error';
import { AdminInputError } from './admin.repository';
import { AuditRepository } from './audit.repository';

const REASON_MIN = 10;
const REASON_MAX = 1000;

export class RevealAuditEventDto {
  @ApiProperty({ minLength: REASON_MIN, maxLength: REASON_MAX })
  @IsString()
  @MinLength(REASON_MIN)
  @MaxLength(REASON_MAX)
  readonly reason!: string;
}

/**
 * The window is text because a chain position is a bigint. Accepting a JSON
 * number here would silently round anything past 2^53, which is the same
 * mistake `packages/contract/src/money.ts` exists to prevent for amounts.
 */
export class VerifyChainDto {
  @ApiProperty({ required: false, pattern: '^\\d{1,18}$' })
  @IsOptional()
  @IsString()
  @MaxLength(18)
  readonly fromSequence?: string;

  @ApiProperty({ required: false, pattern: '^\\d{1,18}$' })
  @IsOptional()
  @IsString()
  @MaxLength(18)
  readonly toSequence?: string;
}

export class RetentionPolicyDto {
  @ApiProperty({ minimum: 1, maximum: 3650 })
  @IsInt()
  @Min(1)
  @Max(3650)
  readonly retentionDays!: number;

  @ApiProperty({ maxLength: 500 })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  readonly legalBasis!: string;

  @ApiProperty({ maxLength: 1000 })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  readonly description!: string;

  @ApiProperty({ required: false, format: 'date-time' })
  @IsOptional()
  @IsISO8601()
  readonly effectiveAt?: string;

  @ApiProperty({ minLength: REASON_MIN, maxLength: REASON_MAX })
  @IsString()
  @MinLength(REASON_MIN)
  @MaxLength(REASON_MAX)
  readonly reason!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class DispositionDto {
  @ApiProperty()
  @IsString()
  @MaxLength(32)
  readonly category!: string;

  @ApiProperty({ pattern: '^\\d{1,18}$' })
  @IsString()
  @MaxLength(18)
  readonly fromSequence!: string;

  @ApiProperty({ pattern: '^\\d{1,18}$' })
  @IsString()
  @MaxLength(18)
  readonly toSequence!: string;

  @ApiProperty({ enum: ['archived', 'destroyed', 'retained_on_hold'] })
  @IsIn(['archived', 'destroyed', 'retained_on_hold'])
  readonly method!: 'archived' | 'destroyed' | 'retained_on_hold';

  @ApiProperty({ required: false, maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  readonly note?: string;

  @ApiProperty({ minLength: REASON_MIN, maxLength: REASON_MAX })
  @IsString()
  @MinLength(REASON_MIN)
  @MaxLength(REASON_MAX)
  readonly reason!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

/**
 * The audit surface spec 14.9 asks for: search across every named axis,
 * masked rows by default, an explicit and self-auditing reveal, chain
 * verification with its own history, and the retention record.
 *
 * Reveal, retention and disposition carry the step-up guards even though two
 * of them only write a record: what they write is the evidence, and 14.9 puts
 * high-risk actions behind reauthentication.
 */
@ApiTags('admin')
@Controller('admin/audit')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard)
export class AdminAuditController {
  constructor(@Inject(AuditRepository) private readonly audit: AuditRepository | null) {}

  private repository(): AuditRepository {
    if (!this.audit) throw new ServiceUnavailableException('the audit trail is unavailable');
    return this.audit;
  }

  private async guarded<T>(work: () => Promise<T>, message: string): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (error instanceof AdminInputError) throw new BadRequestException(error.message);
      // Every function on this surface refuses a role with 42501. Without this
      // the refusal fell through to a 500, and the console rendered "try again
      // later" for something that would never succeed.
      if (isRoleRefusal(error)) throw new ForbiddenException('this action needs a higher role');
      if (isMalformedInput(error)) throw new BadRequestException(message);
      if (isAuthorizationFailure(error)) throw new BadRequestException(message);
      if (isExpectedCommandFailure(error)) throw new BadRequestException(message);
      throw error;
    }
  }

  @Get('events')
  @ApiOperation({ summary: 'Search the audit trail; addresses and session hashes are masked' })
  async events(@Req() request: RequestWithSession, @Query() query: Record<string, string>) {
    const events = await this.guarded(
      () =>
        this.repository().searchEvents({
          actorUserId: requireUserId(request),
          filters: {
            from: query.from,
            to: query.to,
            actorFilter: query.administrator,
            subjectUserId: query.member,
            feature: query.feature,
            action: query.action,
            targetId: query.target,
            transactionId: query.transaction,
            requestId: query.request,
            traceId: query.trace,
            clientIp: query.address,
            outcome: query.outcome,
            cursor: query.cursor,
            limit: query.limit === undefined ? 30 : Number.parseInt(query.limit, 10),
          },
        }),
      'the audit trail could not be searched',
    );

    // The cursor is the last row's position, not an offset: the chain grows
    // under a reader and an offset would repeat or skip rows as it does.
    const nextCursor = events.length ? events[events.length - 1]?.sequence : null;
    return { events, nextCursor: events.length ? nextCursor : null };
  }

  @Post('events/:id/reveal')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Unmask one entry; the reveal is itself recorded' })
  reveal(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) auditId: string,
    @Body() body: RevealAuditEventDto,
  ) {
    return this.guarded(
      () =>
        this.repository().revealEvent({
          actorUserId: requireUserId(request),
          auditId,
          reason: body.reason,
        }),
      'the entry was not revealed',
    );
  }

  @Post('verify')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Recompute the hash chain over a window and record the result' })
  verify(@Req() request: RequestWithSession, @Body() body: VerifyChainDto) {
    return this.guarded(
      () =>
        this.repository().verifyChain({
          actorUserId: requireUserId(request),
          fromSequence: body.fromSequence ?? null,
          toSequence: body.toSequence ?? null,
        }),
      'the chain could not be verified',
    );
  }

  @Get('verifications')
  @ApiOperation({ summary: 'Past chain verifications' })
  async verifications(@Req() request: RequestWithSession) {
    return {
      verifications: await this.guarded(
        () => this.repository().listVerifications({ actorUserId: requireUserId(request) }),
        'the verification history could not be read',
      ),
    };
  }

  @Get('retention')
  @ApiOperation({ summary: 'Retention periods, what is past them, and the last disposition' })
  async retention(@Req() request: RequestWithSession) {
    return {
      categories: await this.guarded(
        () => this.repository().retentionOverview({ actorUserId: requireUserId(request) }),
        'the retention overview could not be read',
      ),
    };
  }

  @Put('retention/:category')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Append a retention policy version for one category' })
  setRetention(
    @Req() request: RequestWithSession,
    @Param('category') category: string,
    @Body() body: RetentionPolicyDto,
  ) {
    return this.guarded(
      () =>
        this.repository().setRetentionPolicy({
          idempotencyKey: body.idempotencyKey,
          actorUserId: requireUserId(request),
          category,
          retentionDays: body.retentionDays,
          legalBasis: body.legalBasis,
          description: body.description,
          effectiveAt: body.effectiveAt ?? null,
          reason: body.reason,
        }),
      'the retention policy was not changed',
    );
  }

  @Get('dispositions')
  @ApiOperation({ summary: 'What was archived, destroyed or held' })
  async dispositions(@Req() request: RequestWithSession) {
    return {
      dispositions: await this.guarded(
        () => this.repository().listDispositions({ actorUserId: requireUserId(request) }),
        'the disposition record could not be read',
      ),
    };
  }

  @Post('dispositions')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Record what was decided about a range past its retention period' })
  recordDisposition(@Req() request: RequestWithSession, @Body() body: DispositionDto) {
    return this.guarded(
      () =>
        this.repository().recordDisposition({
          idempotencyKey: body.idempotencyKey,
          actorUserId: requireUserId(request),
          category: body.category,
          fromSequence: body.fromSequence,
          toSequence: body.toSequence,
          method: body.method,
          note: body.note ?? '',
          reason: body.reason,
        }),
      'the disposition was not recorded',
    );
  }
}
