import {
  BadRequestException,
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
import { ProgressionInputError, ProgressionRepository } from './progression.repository';

/**
 * Growth stages and the credit standing they sit next to.
 *
 * Borrowing and repaying are deliberately absent. `POST /api/v1/bank/loans`
 * and `POST /api/v1/bank/loans/{id}/repayments` already serve them from the
 * wallet module, they are the pinned replacements for the original
 * application's loan routes, and a second pair of write routes onto
 * `bank_borrow` and `bank_repay` would give one command two names -- two
 * OpenAPI operations, two rate-limit surfaces, and two places for the next
 * person to change. The loan *list* is served here as well because the credit
 * screen wants the grade and the loans in one request.
 *
 * Guard order is semantic. SessionGuard resolves the session onto the request
 * and everything after it reads what that attached; CsrfGuard cannot verify a
 * token without a session id. CsrfGuard sits at class level and exits early on
 * GET, HEAD and OPTIONS, so the two reads below are not asked for a token
 * while the refresh -- which writes a `user_progression` row -- is.
 */
@ApiTags('progression')
@Controller('progression')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
export class ProgressionController {
  constructor(
    @Inject(ProgressionRepository) private readonly progression: ProgressionRepository | null,
  ) {}

  private repository(): ProgressionRepository {
    if (!this.progression) throw new ServiceUnavailableException('progression is unavailable');
    return this.progression;
  }

  /**
   * The three codes mean three different things to a member and would
   * otherwise all arrive as one conflict: 22023 is a request the rules refuse,
   * 28000 is `progression_refresh` declining an account that is not active,
   * and anything else is a fault that must reach the logs as a 500 rather than
   * be reported as the member's mistake.
   */
  private async guarded<T>(work: () => Promise<T>, conflictMessage: string): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (error instanceof ProgressionInputError) throw new BadRequestException(error.message);
      if (isAuthorizationFailure(error)) throw new ForbiddenException('this account is not active');
      if (isExpectedCommandFailure(error)) throw new ConflictException(conflictMessage);
      throw error;
    }
  }

  /**
   * Wrapped in an object rather than returned bare, because the answer is
   * legitimately null: a member who has never been refreshed has no stage yet.
   * Nest renders a bare null as an empty body, which a page cannot tell apart
   * from a failed request, and "not computed yet" is a state the screen has to
   * show.
   */
  @Get()
  @ApiOperation({ summary: 'The caller’s growth stage and what unlocks the next one' })
  async status(@Req() request: RequestWithSession) {
    return {
      progression: await this.guarded(
        () => this.repository().status(requireUserId(request)),
        'the growth stage is unavailable',
      ),
    };
  }

  /**
   * A collection of recomputations rather than a verb path, following the
   * convention the route map records: the action becomes a sub-resource and
   * the verb moves into the method. No body -- the function takes the actor
   * and nothing else, and recomputing is idempotent, so there is no key to
   * carry.
   */
  @Post('refreshes')
  @ApiOperation({ summary: 'Recompute the caller’s growth stage from their progress' })
  async refresh(@Req() request: RequestWithSession) {
    return {
      progression: await this.guarded(
        () => this.repository().refresh(requireUserId(request)),
        'the growth stage was not recomputed',
      ),
    };
  }

  /**
   * The grade and the loans in one request. Two round trips to the database,
   * issued together: the screen renders them side by side, and a second
   * endpoint would be a second thing to keep in step with this one.
   *
   * `terms` is missing on purpose. What a grade buys -- the credit limit, the
   * rate, the term and the minimum repayment -- lives in
   * `bank_credit_policies`, which `moneyverse_app` cannot read and which no
   * SECURITY DEFINER function exposes yet. Reciting the seeded numbers from
   * TypeScript would state a policy the database does not agree to.
   */
  @Get('credit')
  @ApiOperation({ summary: 'The caller’s credit grade and their loans' })
  async credit(@Req() request: RequestWithSession) {
    const actor = requireUserId(request);
    const [grade, loans] = await this.guarded(
      () => Promise.all([this.repository().creditGrade(actor), this.repository().loans(actor)]),
      'credit standing is unavailable',
    );
    return { grade: grade.grade, loans };
  }
}
