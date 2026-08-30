import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Post,
  Put,
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
import {
  EngagementNpcOrderDto,
  EngagementPreferencesDto,
  EngagementProgressDto,
} from './engagement.dto';
import { EngagementInputError, EngagementRepository } from './engagement.repository';

/**
 * Quests, the orders NPCs hand out, and the preference that decides whether a
 * member hears about either.
 *
 * Two things a screen will look for are deliberately not here, because 082
 * grants no function that could answer them and reciting the seeded rows from
 * TypeScript would state a catalogue the database does not agree to:
 *
 *  - the NPC directory. `npc_profiles` and `npc_relationships` are revoked
 *    from moneyverse_app and no reader exists, so the codes an order is
 *    placed against have to come from somewhere other than this API for now.
 *  - the member's unlocked `collection_entries`, which a completed weekly
 *    goal writes and nothing can read back.
 *
 * Guard order is semantic. SessionGuard resolves the session onto the request
 * and everything after it reads what that attached; CsrfGuard cannot verify a
 * token without a session id. CsrfGuard sits at class level and exits early
 * on GET, HEAD and OPTIONS, so the one read below is not asked for a token
 * while the three writes are.
 *
 * There is no anonymous route here. Every answer is one member's own
 * progress, and the dashboard raises 28000 for anybody who is not an active
 * member.
 */
@ApiTags('engagement')
@Controller('engagement')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
export class EngagementController {
  constructor(
    @Inject(EngagementRepository) private readonly engagement: EngagementRepository | null,
  ) {}

  private repository(): EngagementRepository {
    if (!this.engagement) throw new ServiceUnavailableException('engagement is unavailable');
    return this.engagement;
  }

  /**
   * The three codes mean three different things to a member and would
   * otherwise all arrive as one conflict: 22023 is a request the rules refuse
   * -- an unknown goal, an unknown NPC, an amount outside the bounds -- 28000
   * is a receipt belonging to somebody else or an account that is not active,
   * and anything else is a fault that must reach the logs as a 500 rather
   * than be reported as the member's mistake.
   *
   * 42501 is not mapped on purpose. No function in 082 raises it deliberately,
   * so a 42501 arriving here is PostgreSQL's own privilege check answering a
   * lost GRANT: the deployment is broken, the member cannot fix it, and it
   * must stay a 500 and page somebody.
   */
  private async guarded<T>(work: () => Promise<T>, conflictMessage: string): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (error instanceof EngagementInputError) throw new BadRequestException(error.message);
      if (isAuthorizationFailure(error)) throw new ForbiddenException('this is not yours');
      if (isExpectedCommandFailure(error)) throw new ConflictException(conflictMessage);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Today’s goals, this week’s goals, the next unlock and the preference' })
  dashboard(@Req() request: RequestWithSession) {
    return this.guarded(
      () => this.repository().dashboard(requireUserId(request)),
      'the engagement summary is unavailable',
    );
  }

  /**
   * A collection of progress records under the goal they belong to, following
   * the convention the route map records: the action becomes a sub-resource
   * and the verb moves into the method. The goal code sits in the path rather
   * than the body for the same reason a purchase names its item there.
   *
   * The catalogue code is not a UUID, so no ParseUUIDPipe: the repository
   * checks it against 081's own CHECK and a mistyped code becomes a 400.
   */
  @Post('goals/:code/progress')
  @ApiOperation({ summary: 'Record progress against one goal' })
  recordProgress(
    @Req() request: RequestWithSession,
    @Param('code') goalCode: string,
    @Body() body: EngagementProgressDto,
  ) {
    return this.guarded(
      () =>
        this.repository().recordProgress(
          body.idempotencyKey,
          requireUserId(request),
          goalCode,
          body.amount ?? 1,
        ),
      'the progress was not recorded',
    );
  }

  /**
   * Taking an order from an NPC. The order is worth one point of affinity and
   * one step of `neighbour_help`, both decided by 082 rather than sent from
   * here -- there is no amount on this route for that reason.
   */
  @Post('npcs/:code/orders')
  @ApiOperation({ summary: 'Take an order from an NPC' })
  recordNpcOrder(
    @Req() request: RequestWithSession,
    @Param('code') npcCode: string,
    @Body() body: EngagementNpcOrderDto,
  ) {
    return this.guarded(
      () => this.repository().recordNpcOrder(body.idempotencyKey, requireUserId(request), npcCode),
      'the order was not accepted',
    );
  }

  /**
   * PUT rather than POST, and no idempotency key: this replaces one row keyed
   * by the member, so sending it twice leaves the same preference behind.
   *
   * The answer carries 081's own column name rather than the request's
   * camelCase, so that it matches the field the dashboard already reports the
   * preference under and a screen does not have to know which of the two
   * produced the value it is holding.
   */
  @Put('preferences')
  @ApiOperation({ summary: 'Set whether the member hears about their goals' })
  async setPreferences(
    @Req() request: RequestWithSession,
    @Body() body: EngagementPreferencesDto,
  ) {
    const notificationsEnabled = await this.guarded(
      () => this.repository().setPreferences(requireUserId(request), body.notificationsEnabled),
      'the preference was not changed',
    );
    return { notifications_enabled: notificationsEnabled };
  }
}
