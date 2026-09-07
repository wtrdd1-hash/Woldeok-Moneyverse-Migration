import { randomUUID } from 'node:crypto';
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
  IsBoolean,
  IsIn,
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

export class ToggleKillswitchDto {
  @ApiProperty({ enum: ['master', 'financial', 'business', 'exchange', 'auto_balancing'] })
  @IsIn(['master', 'financial', 'business', 'exchange', 'auto_balancing'])
  readonly scope!: string;

  @ApiProperty()
  @IsBoolean()
  readonly active!: boolean;
}

export class UpdateKnobsV2Dto {
  @ApiProperty({ description: '일일 복리 이자율 bps (예: 5 = 0.05%)' })
  @IsInt()
  @Min(0)
  @Max(5000)
  readonly depositRateBps!: number;

  @ApiProperty({ description: '7일 국채 만기 수익률 bps (예: 100 = 1.0%)' })
  @IsInt()
  @Min(0)
  @Max(10000)
  readonly bond7dBps!: number;

  @ApiProperty({ description: '30일 국채 만기 수익률 bps (예: 500 = 5.0%)' })
  @IsInt()
  @Min(0)
  @Max(20000)
  readonly bond30dBps!: number;

  @ApiProperty({ description: '대출 일일 이자율 bps (예: 10 = 0.1%)' })
  @IsInt()
  @Min(0)
  @Max(10000)
  readonly loanRateBps!: number;
}

export class OverrideUserAssetDto {
  @ApiProperty({ enum: ['cash', 'bank'] })
  @IsIn(['cash', 'bank'])
  readonly assetType!: 'cash' | 'bank';

  @ApiProperty({ type: String, example: '1000' })
  @IsString()
  @Matches(/^[1-9]\d{0,12}$/)
  readonly amount!: string;

  @ApiProperty({ enum: ['credit_grant', 'debit_confiscate'] })
  @IsIn(['credit_grant', 'debit_confiscate'])
  readonly direction!: 'credit_grant' | 'debit_confiscate';

  @ApiProperty({ minLength: 5, maxLength: 500 })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  readonly reason!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  readonly idempotencyKey?: string;
}

@ApiTags('admin')
@Controller('admin/economy')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard)
export class AdminEconomyController {

  @Get('stats')
  @ApiOperation({ summary: 'Realtime Faucet vs Sink stats and circulation summary' })
  async stats() {
    return await this.repository().faucetSinkStats();
  }

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
  @UseGuards(CsrfGuard)
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
  @UseGuards(CsrfGuard)
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

  @Get('macro-v2')
  @ApiOperation({ summary: 'Admin Control Center 2.0 Macro Economy statistics' })
  async macroV2(@Req() request: RequestWithSession) {
    return await this.repository().macroEconomyV2(requireUserId(request));
  }

  /**
   * The three levers below are high-risk writes in the sense of §10 and
   * §14.9: the kill switch stops the whole economy, the knobs reprice every
   * deposit and loan, and the override moves WLD into or out of a member's
   * accounts. They carry the same step-up as bulk payouts and reversals --
   * a sign-in confirmation and a code spent in the last two minutes -- and
   * the functions behind them (125) require the superadmin on their own.
   */
  @Post('killswitch')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Toggle master killswitch or module circuit breaker' })
  toggleKillswitch(@Req() request: RequestWithSession, @Body() body: ToggleKillswitchDto) {
    return this.guarded(
      () =>
        this.repository().toggleKillswitch({
          scope: body.scope,
          active: body.active,
          adminId: requireUserId(request),
        }),
      'failed to toggle killswitch',
    );
  }

  @Post('knobs-v2')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Update economic knobs (interest, bond yields, loan rates)' })
  updateKnobsV2(@Req() request: RequestWithSession, @Body() body: UpdateKnobsV2Dto) {
    return this.guarded(
      () =>
        this.repository().updateEconomicKnobsV2({
          depositRateBps: body.depositRateBps,
          bond7dBps: body.bond7dBps,
          bond30dBps: body.bond30dBps,
          loanRateBps: body.loanRateBps,
          adminId: requireUserId(request),
        }),
      'failed to update economic knobs',
    );
  }

  @Get('users/:id/inspect-v2')
  @ApiOperation({ summary: 'Inspect user wallet, deposits, loans, jobs, businesses' })
  inspectUserV2(@Req() request: RequestWithSession, @Param('id', ParseUUIDPipe) userId: string) {
    return this.guarded(
      () => this.repository().inspectUserAssetsV2(requireUserId(request), userId),
      'failed to inspect user assets',
    );
  }

  @Post('users/:id/override-v2')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Override user cash or bank balance (grant or confiscate WLD)' })
  overrideUserV2(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() body: OverrideUserAssetDto,
  ) {
    const idempotencyKey = body.idempotencyKey ?? randomUUID();
    return this.guarded(
      () =>
        this.repository().overrideUserAssetV2({
          targetUserId: userId,
          assetType: body.assetType,
          amount: body.amount,
          direction: body.direction,
          reason: body.reason,
          adminId: requireUserId(request),
          idempotencyKey,
        }),
      'failed to override user asset',
    );
  }

}
