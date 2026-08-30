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
import { WorkAssignmentDto, WorkCompletionDto } from './work.dto';
import { WorkInputError, WorkRepository } from './work.repository';

/**
 * Guard order is semantic. SessionGuard resolves the session onto the
 * request and everything after it reads what that attached; CsrfGuard cannot
 * verify a token without a session id. CsrfGuard sits at class level and
 * exits early on GET, HEAD and OPTIONS, so the two reads below are not asked
 * for a token.
 */
@ApiTags('work')
@Controller('work')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
export class WorkController {
  constructor(@Inject(WorkRepository) private readonly work: WorkRepository | null) {}

  private repository(): WorkRepository {
    if (!this.work) throw new ServiceUnavailableException('work is unavailable');
    return this.work;
  }

  /**
   * The three codes mean three different things to a member and were all
   * arriving as one conflict: 22023 is a request the rules refuse, 28000 is a
   * receipt belonging to somebody else, and anything else is a fault that
   * must reach the logs as a 500 rather than be reported as their mistake.
   */
  private async guarded<T>(work: () => Promise<T>, conflictMessage: string): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (error instanceof WorkInputError) throw new BadRequestException(error.message);
      if (isAuthorizationFailure(error)) throw new ForbiddenException('this is not yours');
      if (isExpectedCommandFailure(error)) throw new ConflictException(conflictMessage);
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
