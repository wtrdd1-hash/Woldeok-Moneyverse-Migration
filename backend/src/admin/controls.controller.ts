import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsISO8601,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
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
import { isAuthorizationFailure, isExpectedCommandFailure } from '../core/pg-error';
import { ControlsInputError, ControlsRepository } from './controls.repository';

/**
 * A reason long enough to mean something, mirrored from
 * `admin_normalized_reason` in migration 058 so a short one is refused before
 * it reaches the database and comes back as a message about a function.
 */
const REASON_MIN = 10;
const REASON_MAX = 1000;

export class FeatureSwitchDto {
  @ApiProperty({ enum: ['enabled', 'paused', 'safe_mode', 'disabled'] })
  @IsIn(['enabled', 'paused', 'safe_mode', 'disabled'])
  readonly state!: 'enabled' | 'paused' | 'safe_mode' | 'disabled';

  @ApiProperty({ minLength: REASON_MIN, maxLength: REASON_MAX })
  @IsString()
  @MinLength(REASON_MIN)
  @MaxLength(REASON_MAX)
  readonly reason!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class PolicyVersionDto {
  @ApiProperty({ maxLength: 64 })
  @IsString()
  @MaxLength(64)
  readonly version!: string;

  /**
   * Omitted means now. A policy with a future instant here is stored approved
   * and activated by the sweep when it comes due, which is what
   * "예약 발효" asks for.
   */
  @ApiProperty({ required: false, description: 'ISO 8601 instant; omitted means immediately' })
  @IsOptional()
  @IsISO8601()
  readonly effectiveAt?: string;

  @ApiProperty({ type: Object })
  @IsObject()
  readonly payload!: Record<string, unknown>;

  @ApiProperty({ minLength: REASON_MIN, maxLength: REASON_MAX })
  @IsString()
  @MinLength(REASON_MIN)
  @MaxLength(REASON_MAX)
  readonly reason!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class ReasonedCommandDto {
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
 * Every field but the reason is optional: taking one knob off automatic and
 * widening its approved range are different acts, and 092 leaves a field it
 * was not given alone rather than resetting it to a default.
 */
export class PolicyKnobDto extends ReasonedCommandDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  readonly autoAdjustable?: boolean;

  @ApiProperty({ required: false, type: String, description: 'decimal string or number' })
  @IsOptional()
  readonly minValue?: number | string;

  @ApiProperty({ required: false, type: String, description: 'decimal string or number' })
  @IsOptional()
  readonly maxValue?: number | string;
}

export class RoleDesignationDto extends ReasonedCommandDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly userId!: string;

  @ApiProperty({ enum: ['operator', 'approver', 'server_operator', 'superadmin'] })
  @IsIn(['operator', 'approver', 'server_operator', 'superadmin'])
  readonly role!: 'operator' | 'approver' | 'server_operator' | 'superadmin';
}

/**
 * The control plane the single superadmin replaced two-person approval with.
 *
 * The guard chain is the console's, plus two more on every write:
 * `ReauthGuard`, so the caller has proved control of their OAuth identity,
 * and `SecondFactorGuard`, so they typed a code into the dialog that named
 * what was about to change. Flipping a feature off, moving the economy to a
 * new policy version and handing somebody the superadmin designation are the
 * three things nobody else can now object to, so each of them costs both.
 *
 * Every command is idempotent by a caller-supplied key and returns the state
 * before as well as the state after, because the screen that asked has to be
 * able to show what actually happened rather than what it hoped would.
 */
@ApiTags('admin')
@Controller('admin/controls')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard)
export class AdminControlsController {
  constructor(@Inject(ControlsRepository) private readonly controls: ControlsRepository | null) {}

  private repository(): ControlsRepository {
    if (!this.controls) throw new ServiceUnavailableException('control plane is unavailable');
    return this.controls;
  }

  private async guarded<T>(work: () => Promise<T>, message: string): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (error instanceof ControlsInputError) throw new BadRequestException(error.message);
      if (isAuthorizationFailure(error)) throw new BadRequestException(message);
      if (isExpectedCommandFailure(error)) throw new BadRequestException(message);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Feature switches, economy policy versions and role assignments' })
  async overview(@Req() request: RequestWithSession) {
    const actor = requireUserId(request);
    const repository = this.repository();
    const [featureSwitches, policies] = await Promise.all([
      repository.featureSwitches(actor),
      repository.policies(actor),
    ]);
    // Roles are superadmin-only and every administrator can reach this page,
    // so a refusal here is an expected answer rather than a failure.
    const roles = await repository.roles(actor).catch((error: unknown) => {
      if (isAuthorizationFailure(error) || isExpectedCommandFailure(error)) return [];
      throw error;
    });
    return { featureSwitches, policies, roles };
  }

  /**
   * The automatic policy scheduler is an operational enable/pause control,
   * not a direct balance mutation. The operator explicitly requested that
   * this one switch require only the authenticated admin session, CSRF token,
   * reason and audit logging. This concrete route must stay above the parameter
   * route so every other feature switch retains SecondFactorGuard.
   */
  @Put('feature-switches/economy_auto_policy')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Enable or pause the automatic economy policy without step-up' })
  setAutoPolicyFeatureSwitch(
    @Req() request: RequestWithSession,
    @Body() body: FeatureSwitchDto,
  ) {
    return this.changeFeatureSwitch(request, 'economy_auto_policy', body);
  }

  @Put('feature-switches/:featureKey')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Enable, pause, put into safe mode or disable a feature' })
  setFeatureSwitch(
    @Req() request: RequestWithSession,
    @Param('featureKey') featureKey: string,
    @Body() body: FeatureSwitchDto,
  ) {
    return this.changeFeatureSwitch(request, featureKey, body);
  }

  private changeFeatureSwitch(
    request: RequestWithSession,
    featureKey: string,
    body: FeatureSwitchDto,
  ) {
    return this.guarded(
      () =>
        this.repository().setFeatureSwitch({
          idempotencyKey: body.idempotencyKey,
          actorUserId: requireUserId(request),
          featureKey,
          state: body.state,
          reason: body.reason,
        }),
      'the feature switch was not changed',
    );
  }

  @Post('policies')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Create an economy policy version, immediate or scheduled' })
  createPolicyVersion(@Req() request: RequestWithSession, @Body() body: PolicyVersionDto) {
    return this.guarded(
      () =>
        this.repository().createPolicyVersion({
          idempotencyKey: body.idempotencyKey,
          actorUserId: requireUserId(request),
          version: body.version,
          effectiveAt: body.effectiveAt ?? null,
          payload: body.payload,
          reason: body.reason,
        }),
      'the policy version was not created',
    );
  }

  @Post('policies/rollbacks')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Return the economy to the previous policy version' })
  rollbackPolicy(@Req() request: RequestWithSession, @Body() body: ReasonedCommandDto) {
    return this.guarded(
      () =>
        this.repository().rollbackPolicy({
          idempotencyKey: body.idempotencyKey,
          actorUserId: requireUserId(request),
          reason: body.reason,
        }),
      'the policy was not rolled back',
    );
  }

  /**
   * Runs the scheduled-activation sweep now. It exists so a scheduled version
   * can be brought forward by hand while there is no scheduler; PR7 adds the
   * one that calls this on a clock.
   */
  @Post('policies/activations')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Activate every policy version whose effective time has passed' })
  activateDuePolicies() {
    return this.guarded(
      () => this.repository().activateDuePolicies(),
      'no policy version was activated',
    );
  }

  /**
   * The engine's dials and what it would do with this week's numbers. The
   * preview is the same object the weekly run acts on, so what an operator
   * reads here is what would happen, not a description of it.
   */
  @Get('auto-policy')
  @ApiOperation({ summary: 'Policy knobs and the adjustment the engine would propose today' })
  async autoPolicy(@Req() request: RequestWithSession) {
    const actor = requireUserId(request);
    const repository = this.repository();
    const [knobs, preview] = await Promise.all([
      repository.policyKnobs(actor),
      repository.autoPolicyPreview(actor),
    ]);
    return { knobs, preview };
  }

  @Post('auto-policy/runs')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Run the automatic adjustment now instead of waiting for Monday' })
  runAutoPolicy(@Req() request: RequestWithSession, @Body() body: ReasonedCommandDto) {
    return this.guarded(
      () =>
        this.repository().runAutoPolicy({
          idempotencyKey: body.idempotencyKey,
          actorUserId: requireUserId(request),
          reason: body.reason,
        }),
      'the automatic adjustment did not run',
    );
  }

  @Put('auto-policy/knobs/:knobKey')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Take one knob off automatic, or move its approved range' })
  setPolicyKnob(
    @Req() request: RequestWithSession,
    @Param('knobKey') knobKey: string,
    @Body() body: PolicyKnobDto,
  ) {
    return this.guarded(
      () =>
        this.repository().setPolicyKnob({
          idempotencyKey: body.idempotencyKey,
          actorUserId: requireUserId(request),
          knobKey,
          autoAdjustable: body.autoAdjustable,
          minValue: body.minValue,
          maxValue: body.maxValue,
          reason: body.reason,
        }),
      'the knob was not changed',
    );
  }

  @Post('roles')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Grant an administrative role, or move the superadmin designation' })
  grantRole(@Req() request: RequestWithSession, @Body() body: RoleDesignationDto) {
    return this.guarded(
      () =>
        this.repository().grantRole({
          idempotencyKey: body.idempotencyKey,
          actorUserId: requireUserId(request),
          targetUserId: body.userId,
          role: body.role,
          reason: body.reason,
        }),
      'the role was not granted',
    );
  }

  @Post('role-revocations')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Take back an administrative role' })
  revokeRole(@Req() request: RequestWithSession, @Body() body: RoleDesignationDto) {
    return this.guarded(
      () =>
        this.repository().revokeRole({
          idempotencyKey: body.idempotencyKey,
          actorUserId: requireUserId(request),
          targetUserId: body.userId,
          role: body.role,
          reason: body.reason,
        }),
      'the role was not revoked',
    );
  }
}
