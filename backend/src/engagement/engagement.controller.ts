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
import { EarlyGameInputError, EarlyGameRepository } from '../early-game/early-game.repository';
import { EngagementNpcOrderDto, EngagementPreferencesDto } from './engagement.dto';
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
    // `early`, not `earlyGame`: the route method below is `earlyGame`, and a
    // constructor parameter property is a class member like any other.
    @Inject(EarlyGameRepository) private readonly early: EarlyGameRepository | null,
  ) {}

  private repository(): EngagementRepository {
    if (!this.engagement) throw new ServiceUnavailableException('engagement is unavailable');
    return this.engagement;
  }

  private earlyGameRepository(): EarlyGameRepository {
    if (!this.early) throw new ServiceUnavailableException('engagement is unavailable');
    return this.early;
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
      if (error instanceof EarlyGameInputError) throw new BadRequestException(error.message);
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

  /*
   * There is no route that records progress.
   *
   * `engagement_record_progress` grants a collection entry and a title when a
   * count reaches its target, and it verifies nothing about the activity that
   * supposedly produced the count. Exposed to the member it counts for, it is
   * a button that awards `starter` on one press and `neighbour_help` without
   * ever helping anybody. The function is right; the caller has to be
   * whatever records the activity -- a completed work assignment, a purchase,
   * an accepted order -- and none of those call it yet. Until one does, the
   * board reports and does not grant.
   */
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
  async setPreferences(@Req() request: RequestWithSession, @Body() body: EngagementPreferencesDto) {
    const notificationsEnabled = await this.guarded(
      () => this.repository().setPreferences(requireUserId(request), body.notificationsEnabled),
      'the preference was not changed',
    );
    return { notifications_enabled: notificationsEnabled };
  }

  /**
   * 16.1's weekly goals and its two collection books.
   *
   * They belong here, next to the quests screen that renders them, and they
   * are two reads in one request because that screen shows them together.
   *
   * They are also the answer to the two things this controller's comment says
   * it could not serve. The collection a member has unlocked was written by
   * `engagement_record_progress` and readable by nothing; the weekly goals it
   * does report have no target and no verified progress, because that function
   * takes a member's word for the count. These goals take no report at all --
   * 101 computes each one from work receipts, shop purchases and ledger
   * postings -- which is why there is no write route beside this read and must
   * not be one.
   */
  @Get('early-game')
  @ApiOperation({ summary: 'The early-game weekly goals and collection books' })
  async earlyGame(@Req() request: RequestWithSession) {
    const actor = requireUserId(request);
    const [goals, collections] = await this.guarded(
      () =>
        Promise.all([
          this.earlyGameRepository().weeklyGoals(actor),
          this.earlyGameRepository().collections(actor),
        ]),
      'the early game summary is unavailable',
    );
    return { goals, collections };
  }
}
