import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Inject,
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
import { EarlyEventClaimDto } from './early-game.dto';
import { EarlyGameInputError, EarlyGameRepository } from './early-game.repository';

/**
 * 16.1's daily event and its first-day flow.
 *
 * Its own controller rather than three more routes on /engagement, because
 * this is the first part of the early game that writes. The two reads there
 * are a summary of things other functions recorded; the claim below mints,
 * grants experience and hands over an item, and a write surface that sits
 * inside a module documented as read-only is how the next person stops
 * believing that comment.
 *
 * The claim carries no event. `early_event_claim` (103) draws from a hash of
 * the member and the Seoul date and pays what the draw returns, so refreshing
 * the page, replaying the request, or posting it by hand all reach the same
 * one event -- and `early_event_claims` is keyed on (member, day), so it can
 * be reached exactly once.
 *
 * Guard order is semantic. SessionGuard resolves the session onto the request
 * and everything after it reads what that attached; CsrfGuard cannot verify a
 * token without a session id. CsrfGuard sits at class level and exits early on
 * GET, HEAD and OPTIONS, so the two reads are not asked for a token while the
 * claim is.
 */
@ApiTags('early-game')
@Controller('early-game')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
export class EarlyGameController {
  // `early`, not `earlyGame`: a constructor parameter property is a class
  // member like any other, and one sharing a name with a route method on the
  // same controller is a TS2300.
  constructor(@Inject(EarlyGameRepository) private readonly early: EarlyGameRepository | null) {}

  private repository(): EarlyGameRepository {
    if (!this.early) throw new ServiceUnavailableException('the early game is unavailable');
    return this.early;
  }

  /**
   * The three codes mean three different things to a member and would
   * otherwise all arrive as one conflict: 22023 is a request the rules refuse
   * -- a date that is not today, an event that pays only experience to a
   * member who has never worked -- 23505 is today's event already claimed,
   * 55000 is the catalogue switched off, and 28000 is a receipt belonging to
   * somebody else or an account that is not active. Anything else is a fault
   * that must reach the logs as a 500 rather than be reported as the member's
   * mistake.
   *
   * 42501 is not mapped on purpose. No function in 103 raises it deliberately,
   * so a 42501 here is PostgreSQL's own privilege check answering a lost
   * GRANT: the deployment is broken and the member cannot fix it.
   */
  private async guarded<T>(work: () => Promise<T>, conflictMessage: string): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (error instanceof EarlyGameInputError) throw new BadRequestException(error.message);
      if (isAuthorizationFailure(error)) throw new ForbiddenException('this is not yours');
      if (isExpectedCommandFailure(error)) throw new ConflictException(conflictMessage);
      throw error;
    }
  }

  /**
   * Wrapped in an object rather than returned bare, because null is a real
   * answer: with no active catalogue row there is no event today. Nest renders
   * a bare null as an empty body, which a page cannot tell apart from a failed
   * request.
   */
  @Get('today')
  @ApiOperation({ summary: 'The event this member is dealt today, and whether it is still theirs' })
  async today(@Req() request: RequestWithSession) {
    return {
      event: await this.guarded(
        () => this.repository().todayEvent(requireUserId(request)),
        'today’s event is unavailable',
      ),
    };
  }

  @Get('first-day')
  @ApiOperation({ summary: 'The seven steps of 16.1’s first day, counted from what happened' })
  async firstDay(@Req() request: RequestWithSession) {
    return {
      steps: await this.guarded(
        () => this.repository().firstDayFlow(requireUserId(request)),
        'the first-day flow is unavailable',
      ),
    };
  }

  /**
   * A collection of claims rather than a verb path, following the convention
   * the route map records: the action becomes a sub-resource and the verb
   * moves into the method.
   */
  @Post('claims')
  @ApiOperation({ summary: 'Claim today’s event, once' })
  claim(@Req() request: RequestWithSession, @Body() body: EarlyEventClaimDto) {
    return this.guarded(
      () =>
        this.repository().claimEvent(
          body.idempotencyKey,
          requireUserId(request),
          body.eventDate,
        ),
      'today’s event could not be claimed',
    );
  }
}
