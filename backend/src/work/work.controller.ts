import {
  BadRequestException,
  Body,
  ConflictException,
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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { isAuthorizationFailure, isExpectedCommandFailure } from '../core/pg-error';
import {
  CertifyQualificationDto,
  JobSwitchDto,
  WorkAssignmentDto,
  WorkCompletionDto,
  WorkDashboardResponseDto,
} from './work.dto';
import {
  parseWorkDifficulty,
  parseWorkTaskAvailableOnly,
  parseWorkTaskMaxDuration,
  parseWorkTaskMaxReward,
  WorkInputError,
  WorkRepository,
} from './work.repository';
import { refuseUnjournaledQualification } from './work-qualification-hold';

@ApiTags('work')
@Controller('work')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
export class WorkController {
  constructor(@Inject(WorkRepository) private readonly work: WorkRepository | null) {}

  private repository(): WorkRepository {
    if (!this.work) throw new ServiceUnavailableException('work is unavailable');
    return this.work;
  }

  private async guarded<T>(work: () => Promise<T>, conflictMessage: string): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (error instanceof WorkInputError) throw new BadRequestException(error.message);
      if (isAuthorizationFailure(error)) throw new ForbiddenException('this is not yours');
      if (isExpectedCommandFailure(error)) {
        const msg = error instanceof Error && error.message ? error.message : conflictMessage;
        const code = msg.includes('work reward quota reached')
          ? 'work_reward_quota_reached'
          : msg.includes('daily completion limit reached')
            ? 'work_task_daily_limit_reached'
            : undefined;
        throw new ConflictException(code ? { message: msg, code } : msg);
      }
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Caps, what has been paid against them, and open assignments' })
  dashboard(@Req() request: RequestWithSession): Promise<WorkDashboardResponseDto | null> {
    return this.guarded(async () => {
      const row = await this.repository().dashboard(requireUserId(request));
      if (!row) return null;
      return {
        daily_paid: row.daily_paid,
        daily_cap: row.daily_cap,
        weekly_paid: row.weekly_paid,
        weekly_cap: row.weekly_cap,
        active_assignments: row.active_assignments,
        game_day_key: row.game_day_key,
        game_week_key: row.game_week_key,
        day_ends_at: row.day_ends_at.toISOString(),
        week_ends_at: row.week_ends_at.toISOString(),
      };
    }, 'the work summary is unavailable');
  }

  @Get('profile')
  @ApiOperation({ summary: 'Current active job and all job masteries' })
  profile(@Req() request: RequestWithSession) {
    return this.guarded(
      () => this.repository().jobProfile(requireUserId(request)),
      'job profile is unavailable',
    );
  }

  @Post('active-job')
  @ApiOperation({ summary: 'Switch active job among 8 specialization careers' })
  switchJob(@Req() request: RequestWithSession, @Body() body: JobSwitchDto) {
    return this.guarded(
      () => this.repository().switchActiveJob(requireUserId(request), body.jobType),
      'failed to switch active job',
    );
  }

  @Get('tasks')
  @ApiOperation({ summary: 'View the active board of available work tasks' })
  async tasks(
    @Req() request: RequestWithSession,
    @Query('minReward') arg1?: unknown,
    @Query('maxDurationSeconds') arg2?: unknown,
    @Query('maxReward') arg3?: unknown,
    @Query('availableOnly') arg4?: unknown,
  ) {
    const repository = this.repository();
    const actor = requireUserId(request);

    // 1. Recommended query: controller.tasks(request, 'true') / 'false'
    if (arg1 === 'true' || arg1 === 'false') {
      const [featureState, tasks] = await Promise.all([
        repository.featureState(),
        this.guarded(() => repository.tasks(actor, arg1), 'the task board is unavailable'),
      ]);
      return { featureState, tasks };
    }

    // 2. Difficulty query: controller.tasks(request, '4') or level 1..5
    if (typeof arg1 === 'string' && /^[1-5]$/.test(arg1)) {
      const diff = parseWorkDifficulty(arg1);
      const [featureState, tasks] = await Promise.all([
        repository.featureState(),
        this.guarded(() => repository.tasks(actor, diff), 'the task board is unavailable'),
      ]);
      return { featureState, tasks };
    }

    // Reject non-canonical inputs (e.g. array, invalid numbers) before touching repository
    if (arg1 !== undefined && typeof arg1 !== 'string') {
      throw new BadRequestException('invalid work task query');
    }
    if (arg1 !== undefined && !/^(?:0|[1-9][0-9]{0,17})$/.test(arg1)) {
      throw new BadRequestException('invalid work task query');
    }

    // Validate remaining params
    let maxDuration: number | null = null;
    let availability = false;
    let ceiling: string | null = null;
    try {
      if (arg2 !== undefined) {
        maxDuration = parseWorkTaskMaxDuration(arg2);
      }
      if (arg3 === '1' || arg3 === '0') {
        availability = parseWorkTaskAvailableOnly(arg3);
      } else if (arg3 !== undefined) {
        ceiling = parseWorkTaskMaxReward(arg3);
      }
      if (arg4 !== undefined) {
        availability = parseWorkTaskAvailableOnly(arg4);
      }
    } catch (error: unknown) {
      if (error instanceof WorkInputError) throw new BadRequestException(error.message);
      throw error;
    }

    const [featureState, tasks] = await Promise.all([
      repository.featureState(),
      this.guarded(
        () => availability
          ? repository.tasks(actor, arg1, maxDuration ?? undefined, true)
          : ceiling !== null
            ? repository.tasks(actor, arg1, maxDuration ?? undefined, ceiling)
            : maxDuration === null
              ? repository.tasks(actor, arg1)
              : repository.tasks(actor, arg1, maxDuration),
        'the task board is unavailable',
      ),
    ]);
    return { featureState, tasks };
  }

  @Post('tasks/:id/complete')
  @ApiOperation({
    summary: 'Deprecated direct completion route; use assignment-based settlement',
    deprecated: true,
  })
  completeTask(@Param('id', ParseUUIDPipe) _taskId: string): never {
    throw new ConflictException({
      code: 'work_assignment_required',
      message:
        'Direct paid completion is disabled. Create an assignment, wait for the server-authoritative minimum duration, submit it, then verify the reward.',
    });
  }

  @Get('receipts')
  @ApiOperation({ summary: 'What the work paid, and the ledger transaction it paid through' })
  async receipts(@Req() request: RequestWithSession) {
    return {
      receipts: await this.guarded(
        () => this.repository().receipts(requireUserId(request)),
        'work receipts are unavailable',
      ),
    };
  }

  @Get('assignments')
  @ApiOperation({ summary: 'The caller’s recent assignments' })
  async assignments(@Req() request: RequestWithSession) {
    return {
      assignments: await this.guarded(
        () => this.repository().assignments(requireUserId(request)),
        'assignments are unavailable',
      ),
    };
  }

  @Post('assignments')
  @ApiOperation({ summary: 'Take a task' })
  assign(@Req() request: RequestWithSession, @Body() body: WorkAssignmentDto) {
    return this.guarded(
      () => this.repository().assign(body.idempotencyKey, requireUserId(request), body.taskId),
      'the task was not assigned',
    );
  }

  @Post('assignments/:id/completions')
  @ApiOperation({ summary: 'Submit a taken task as done' })
  submit(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) assignmentId: string,
    @Body() body: WorkCompletionDto,
  ) {
    return this.guarded(
      () =>
        this.repository().submit(
          body.idempotencyKey,
          requireUserId(request),
          assignmentId,
          body.evidence,
        ),
      'the submission was not accepted',
    );
  }

  @Post('assignments/:id/verify')
  @ApiOperation({ summary: 'Verify a submitted task and pay it, within the caps' })
  verify(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) assignmentId: string,
    @Body() body: WorkCompletionDto,
  ) {
    return this.guarded(
      () => this.repository().verify(body.idempotencyKey, requireUserId(request), assignmentId),
      'the task was not verified',
    );
  }

  @Get('qualifications')
  @ApiOperation({ summary: 'List acquired career qualifications and available exam catalog' })
  qualifications(
    @Req() request: RequestWithSession,
    @Query('jobType') jobType?: string,
  ) {
    return this.guarded(
      () => this.repository().listQualifications(requireUserId(request), jobType),
      'qualifications are unavailable',
    );
  }

  @Post('qualifications/certify')
  @ApiOperation({ summary: 'Career qualification purchase (paused pending ledger-backed settlement)' })
  @ApiResponse({ status: 503, description: 'Qualification fees require verified double-entry ledger settlement.' })
  certify(
    @Req() _request: RequestWithSession,
    @Body() _body: CertifyQualificationDto,
  ): never {
    // Authentication, consent and CSRF guards remain active on this route.
    // Refuse before any repository call can execute migration 234's unsafe fee path.
    return refuseUnjournaledQualification();
  }
}
