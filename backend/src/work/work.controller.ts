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
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { isAuthorizationFailure, isExpectedCommandFailure } from '../core/pg-error';
import { JobSwitchDto, WorkAssignmentDto, WorkCompletionDto, WorkCompleteTaskDto } from './work.dto';
import { WorkInputError, WorkRepository } from './work.repository';

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
        throw new ConflictException(msg);
      }
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Caps, what has been paid against them, and open assignments' })
  dashboard(@Req() request: RequestWithSession) {
    return this.guarded(
      () => this.repository().dashboard(requireUserId(request)),
      'the work summary is unavailable',
    );
  }

  @Get('profile')
  @ApiOperation({ summary: 'Current active job and all job masteries' })
  async profile(@Req() request: RequestWithSession) {
    const repository = this.repository();
    const [profile, featureState] = await Promise.all([
      this.guarded(
        () => repository.jobProfile(requireUserId(request)),
        'job profile is unavailable',
      ),
      repository.featureState(),
    ]);
    return { profile, featureState };
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
  @ApiOperation({ summary: 'Every task on offer plus the administrator-controlled work feature state' })
  async tasks(@Req() request: RequestWithSession) {
    const repository = this.repository();
    const [tasks, featureState] = await Promise.all([
      this.guarded(
        () => repository.tasks(requireUserId(request)),
        'the task board is unavailable',
      ),
      repository.featureState(),
    ]);
    return { tasks, featureState };
  }

  @Post('tasks/:id/complete')
  @ApiOperation({ summary: 'Directly complete a career task with EXP and instant WLD faucet payout' })
  completeTask(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) taskId: string,
    @Body() body: WorkCompleteTaskDto,
  ) {
    return this.guarded(
      () => this.repository().completeTaskV2(body.idempotencyKey, requireUserId(request), taskId),
      'failed to complete task',
    );
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
}
