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
  Query,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
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
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { SecondFactorGuard } from '../auth/guards/second-factor.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import {
  isAuthorizationFailure,
  isExpectedCommandFailure,
  isMalformedInput,
  isRoleRefusal,
} from '../core/pg-error';
import { EconomyConsoleInputError, EconomyConsoleRepository } from './economy.repository';

/**
 * The floor `admin_normalized_reason` (058) enforces. Mirrored here so a
 * reason too short to mean anything is refused before it reaches the database
 * and comes back as a message about a function.
 */
const REASON_MIN = 10;
const REASON_MAX = 1000;

/** `c_maximum_targets` in `admin_execute_bulk_payout`, migration 084. */
const MAX_EXPLICIT_TARGETS = 5000;

/** The CHECK on `admin_bulk_payouts.amount`, migration 084. */
const AMOUNT_MAX = 1_000_000;

export class AlertAcknowledgementDto {
  @ApiProperty({ minLength: REASON_MIN, maxLength: REASON_MAX })
  @IsString()
  @MinLength(REASON_MIN)
  @MaxLength(REASON_MAX)
  readonly reason!: string;
}

/**
 * The filter is flattened into the body rather than nested, because
 * `forbidNonWhitelisted` only reaches a DTO's own properties: a nested plain
 * object would carry any field at all past the pipe and be refused by the
 * database instead, with 22023 and a message naming a function.
 *
 * The three fields are exactly the three `admin_bulk_payout_targets` accepts.
 * Omitting all of them is the deliberate "every active member" batch, and
 * the preview is what stops that being a surprise.
 */
export class BulkPayoutPreviewDto {
  @ApiProperty({ required: false, type: [String], format: 'uuid', maxItems: MAX_EXPLICIT_TARGETS })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_EXPLICIT_TARGETS)
  @IsUUID(undefined, { each: true })
  readonly userIds?: string[];

  @ApiProperty({ required: false, type: Number, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly minWorkCompletions?: number;

  @ApiProperty({ required: false, maxLength: 32, description: 'A progression stage code' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z][a-z0-9_]{1,31}$/)
  readonly stageCode?: string;

  /**
   * A JSON integer, not a string. `enableImplicitConversion` is off in the
   * global pipe, and a payout amount is bounded at a million by the database
   * -- far below the point where a number stops being exact. Every other
   * money value in this module travels as a string, in the other direction.
   */
  @ApiProperty({ type: Number, minimum: 1, maximum: AMOUNT_MAX, description: 'WLD per member' })
  @IsInt()
  @Min(1)
  @Max(AMOUNT_MAX)
  readonly amount!: number;
}

export class BulkPayoutDto extends BulkPayoutPreviewDto {
  @ApiProperty({ minLength: REASON_MIN, maxLength: REASON_MAX })
  @IsString()
  @MinLength(REASON_MIN)
  @MaxLength(REASON_MAX)
  readonly reason!: string;

  @ApiProperty({ format: 'uuid', description: 'One key for the batch; re-send it to retry' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

/**
 * The operations screen of spec 14.9, and the one command on it that moves
 * money to everybody at once.
 *
 * Guard order is semantic: `SessionGuard` resolves the session onto the
 * request and every guard after it reads what that attached. The console
 * chain decides who may knock; `admin_role_holder` and
 * `admin_require_superadmin` inside each function decide who may act, and one
 * is not a substitute for the other.
 *
 * Executing a payout is the only route here carrying `ReauthGuard` and
 * `SecondFactorGuard`. It is the heaviest write in the product -- up to five
 * thousand ledger transactions from one press -- and it is irreversible by
 * anything short of a correction per member. Acknowledging an alert and
 * previewing a batch change nothing that a second look cannot undo, and
 * asking for a code to read a number teaches operators to type codes without
 * reading what they are for.
 *
 * `admin/economy/reconciliations` belongs to `ReconciliationController` in
 * the economy module; nothing here claims a path under it.
 */
@ApiTags('admin')
@Controller('admin/economy')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard)
export class AdminEconomyController {
  constructor(
    @Inject(EconomyConsoleRepository)
    private readonly economy: EconomyConsoleRepository | null,
  ) {}

  private repository(): EconomyConsoleRepository {
    if (!this.economy) throw new ServiceUnavailableException('the economy console is unavailable');
    return this.economy;
  }

  /**
   * The codes mean four different things to an operator. 42501 from one of
   * these functions is a role refusal -- the security model working -- and
   * belongs to the caller as a 403; PostgreSQL's own "permission denied for
   * ..." is a missing GRANT and is deliberately not caught here, so a broken
   * deployment stays a 500 that pages somebody. 28000 is a batch key already
   * spent by another administrator, which every caller here is entitled to
   * know. 22P02 is a value the database would not parse. Anything else is a
   * fault that must reach the logs rather than be reported as their mistake.
   */
  private async guarded<T>(work: () => Promise<T>, message: string): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (error instanceof EconomyConsoleInputError) throw new BadRequestException(error.message);
      if (isRoleRefusal(error)) throw new ForbiddenException('this action needs a higher role');
      if (isAuthorizationFailure(error)) {
        throw new ForbiddenException('this payout belongs to another administrator');
      }
      if (isMalformedInput(error)) throw new BadRequestException(message);
      if (isExpectedCommandFailure(error)) throw new BadRequestException(message);
      throw error;
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Money supply, issuance and burn, concentration and operational health',
  })
  dashboard(@Req() request: RequestWithSession) {
    return this.guarded(
      () => this.repository().dashboard(requireUserId(request)),
      'the economy dashboard could not be read',
    );
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Alerts, unacknowledged first' })
  async alerts(@Req() request: RequestWithSession, @Query('limit') limit?: string) {
    // A query string arrives as text or not at all. Parsing it here keeps the
    // repository's limit check about the number rather than about the shape.
    const requested = limit === undefined ? undefined : Number(limit);
    if (requested !== undefined && !Number.isSafeInteger(requested)) {
      throw new BadRequestException('limit must be a whole number');
    }
    return {
      alerts: await this.guarded(
        () => this.repository().alerts(requireUserId(request), requested),
        'the alerts could not be read',
      ),
    };
  }

  /**
   * No idempotency key: `admin_acknowledge_alert` takes none, because it
   * updates only a row still waiting to be acknowledged. A second press is
   * already harmless and answers `acknowledged: false`, which is also the
   * answer for an alert that does not exist -- the function draws no line
   * between them and this does not invent one.
   */
  @Post('alerts/:id/acknowledgements')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Acknowledge an alert' })
  acknowledgeAlert(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) alertId: string,
    @Body() body: AlertAcknowledgementDto,
  ) {
    return this.guarded(
      () =>
        this.repository().acknowledgeAlert({
          actorUserId: requireUserId(request),
          alertId,
          reason: body.reason,
        }),
      'the alert was not acknowledged',
    );
  }

  /**
   * A POST that writes nothing. The filter is a structured object with a list
   * of member ids in it, which does not survive a query string, and 14.9 asks
   * for the count, the total and the policy version *before* the batch runs.
   */
  @Post('bulk-payouts/previews')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Count the members a payout would reach, and what it would cost' })
  previewBulkPayout(@Req() request: RequestWithSession, @Body() body: BulkPayoutPreviewDto) {
    return this.guarded(
      () =>
        this.repository().previewBulkPayout({
          actorUserId: requireUserId(request),
          filter: {
            userIds: body.userIds,
            minWorkCompletions: body.minWorkCompletions,
            stageCode: body.stageCode,
          },
          amount: body.amount,
        }),
      'the payout could not be previewed',
    );
  }

  @Post('bulk-payouts')
  @UseGuards(CsrfGuard, ReauthGuard, SecondFactorGuard)
  @ApiOperation({ summary: 'Pay every member the filter matches' })
  executeBulkPayout(@Req() request: RequestWithSession, @Body() body: BulkPayoutDto) {
    return this.guarded(
      () =>
        this.repository().executeBulkPayout({
          idempotencyKey: body.idempotencyKey,
          actorUserId: requireUserId(request),
          filter: {
            userIds: body.userIds,
            minWorkCompletions: body.minWorkCompletions,
            stageCode: body.stageCode,
          },
          amount: body.amount,
          reason: body.reason,
        }),
      'the payout did not run',
    );
  }

  @Post('transactions/:id/reversal')
  @UseGuards(CsrfGuard, ReauthGuard, SecondFactorGuard)
  @ApiOperation({ summary: 'Reverse one transaction, posting its opposite back to the ledger' })
  reverseTransaction(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) transactionId: string,
    @Body() body: { readonly idempotencyKey: string; readonly reason: string },
  ) {
    return this.guarded(
      () =>
        this.repository().reverseTransaction({
          idempotencyKey: body.idempotencyKey,
          actorUserId: requireUserId(request),
          transactionId,
          reason: body.reason,
        }),
      'the transaction could not be reversed',
    );
  }

  @Get('bulk-payouts/:id/report')
  @ApiOperation({ summary: 'Who was paid, who was skipped and who failed, one row each' })
  async payoutReport(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) payoutId: string,
  ) {
    return {
      items: await this.guarded(
        () => this.repository().payoutReport(requireUserId(request), payoutId),
        'the payout report could not be read',
      ),
    };
  }
}
