import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpException,
  Inject,
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
import { isAuthorizationFailure, isExpectedCommandFailure, isRoleRefusal } from '../core/pg-error';
import { CasinoDicePlayDto, CasinoPlayDto, CasinoSelfLimitDto } from './casino.dto';
import { CASINO_OPEN, CasinoInputError, CasinoRepository } from './casino.repository';

/**
 * What a member is told when the casino's switch is not 'enabled'.
 *
 * 'disabled' answers 403 and 'paused'/'safe_mode' answer 503, because the
 * three say different things to whoever reads them. 059 defines 'paused' as
 * "existing positions settle, no new requests" and 'safe_mode' as "reduced
 * limits, no new exposure": both are states an operator has put the game into
 * for a while and intends to lift, so "come back later" is literally true and
 * 503 is the status that says it. 'disabled' is the game being shut -- spec
 * 18.6 keeps it shut for the MVP, and 060's trigger will not let it open
 * without a passing million-play trial -- and no amount of waiting by the
 * member changes that, which is a 403.
 *
 * Each carries a `code`, because the status alone cannot be told apart from
 * the other refusals these routes produce: a 403 here would otherwise read
 * exactly like a rejected CSRF token, and a 503 exactly like the database
 * being offline. The reader that turns a refusal into a Korean sentence has
 * nothing else to branch on -- `detail` is English operator prose.
 *
 * A state this code does not recognise is treated as shut rather than open,
 * which is the same direction 059's own default fails in: a switch nobody can
 * read is not permission to play.
 */
function casinoClosed(state: string): HttpException {
  if (state === 'paused') {
    return new ServiceUnavailableException({
      message: 'casino is paused',
      code: 'casino_paused',
    });
  }
  if (state === 'safe_mode') {
    return new ServiceUnavailableException({
      message: 'casino is in safe mode',
      code: 'casino_safe_mode',
    });
  }
  return new ForbiddenException({ message: 'casino is not open', code: 'casino_disabled' });
}

/**
 * The two sentences a route gives up on a refusal it expected: one for a rule
 * saying no, one for the caller being refused. Both are English operator
 * prose; the Korean a member reads is chosen on the other side of the wire.
 */
interface Refusal {
  readonly conflict: string;
  readonly forbidden: string;
}

/**
 * Guard order is semantic. SessionGuard resolves the session onto the request
 * and everything after it reads what that attached; CsrfGuard cannot verify a
 * token without a session id. CsrfGuard sits at class level and exits early
 * on GET, HEAD and OPTIONS, so the two reads below are not asked for a token.
 *
 * There is no anonymous route here. The odds are a disclosure a member sees
 * before staking, not a public advertisement for a game spec 18.6 keeps
 * closed, and both usage figures the terms carry are one member's own.
 */
@ApiTags('casino')
@Controller('casino')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
export class CasinoController {
  constructor(@Inject(CasinoRepository) private readonly casino: CasinoRepository | null) {}

  private repository(): CasinoRepository {
    if (!this.casino) throw new ServiceUnavailableException('casino is unavailable');
    return this.casino;
  }

  /**
   * The switch, consulted before anything else happens.
   *
   * Not used by the play route, which has a reason of its own further down.
   */
  private async requireOpenCasino(): Promise<CasinoRepository> {
    const repository = this.repository();
    const state = await repository.switchState();
    if (state !== CASINO_OPEN) throw casinoClosed(state);
    return repository;
  }

  /**
   * The codes mean four different things to a member and would otherwise
   * arrive as one conflict. 22023/23505/55000/P0001 is a request the rules
   * refuse; 28000 is the caller being refused rather than the request --
   * `casino_play_coin` answers it for a receipt belonging to somebody else and
   * `member_set_casino_self_limit` for an account that is no longer active;
   * 42501 raised by a function -- `casino_play_coin` again, for an inactive
   * member -- is the security model working; anything else is a fault that
   * must reach the logs as a 500 rather than be reported as the member's
   * mistake.
   *
   * Both messages are per route, because the two refusals mean different
   * things on different routes and one sentence for all of them would be
   * wrong somewhere.
   *
   * A 42501 whose message begins "permission denied for" is deliberately not
   * caught by `isRoleRefusal`: that is a missing GRANT, the deployment is
   * broken, and it must stay a 500 and page somebody.
   */
  private mapped(error: unknown, refusal: Refusal): unknown {
    if (error instanceof CasinoInputError) return new BadRequestException(error.message);
    if (isAuthorizationFailure(error) || isRoleRefusal(error)) {
      return new ForbiddenException(refusal.forbidden);
    }
    if (isExpectedCommandFailure(error)) return new ConflictException(refusal.conflict);
    return error;
  }

  private async guarded<T>(work: () => Promise<T>, refusal: Refusal): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      throw this.mapped(error, refusal);
    }
  }

  @Get('coin/terms')
  @ApiOperation({ summary: 'The odds, the stake limits, and what today has already used' })
  async terms(@Req() request: RequestWithSession) {
    const repository = await this.requireOpenCasino();
    return this.guarded(() => repository.terms(requireUserId(request)), {
      conflict: 'the coin game terms are unavailable',
      forbidden: 'the coin game terms are not yours to read',
    });
  }

  @Get('coin/fairness')
  @ApiOperation({ summary: 'The disclosed win probability and the trial that evidences it' })
  async fairness() {
    const repository = await this.requireOpenCasino();
    return this.guarded(() => repository.fairness(), {
      conflict: 'the fairness evidence is unavailable',
      forbidden: 'the fairness evidence is not yours to read',
    });
  }

  /**
   * The one route that does not ask the switch first, and the reason matters.
   *
   * `casino_play_coin` checks the switch itself -- but only after it has
   * looked for an existing receipt, because closing the casino must not turn
   * a member's in-flight retry into an error: that play's money has already
   * moved and the retry only wants the receipt for it. A gate in front of the
   * handler would refuse that retry and leave the member paid or charged with
   * nothing to show for it, undoing a decision 060 made on purpose.
   *
   * So the switch is consulted after the fact instead. 55000 is raised for
   * "casino is not open", but also for a self-exclusion the member set, an
   * unconfigured policy and a missing counterparty; reading the switch is
   * exactly what tells those apart, and it is read only on the failing path.
   * If that read itself fails the error stands: the pool answered a moment
   * ago, so a query failing now is a fault, and masking it to preserve a 409
   * would hide it.
   */
  @Post('coin/plays')
  @ApiOperation({ summary: 'Stake WLD on one toss of the coin' })
  async play(@Req() request: RequestWithSession, @Body() body: CasinoPlayDto) {
    const repository = this.repository();
    try {
      return await repository.play(
        body.idempotencyKey,
        requireUserId(request),
        body.choice,
        body.stake,
      );
    } catch (error: unknown) {
      if (isExpectedCommandFailure(error)) {
        const state = await repository.switchState();
        if (state !== CASINO_OPEN) throw casinoClosed(state);
      }
      throw this.mapped(error, {
        conflict: 'the play was not accepted',
        forbidden: 'the play was not yours to make',
      });
    }
  }

  /**
   * The odds, the payout and the maximum loss for every game at once.
   *
   * One route rather than one per game, because from migration 100 the daily
   * allowances are the member's rather than the game's: three reads would be
   * three readings of one day, and a picker that showed them side by side
   * could show three different answers to the same question.
   */
  @Get('games/terms')
  @ApiOperation({ summary: 'Every game’s odds, payout and remaining exposure for today' })
  async gameTerms(@Req() request: RequestWithSession) {
    const repository = await this.requireOpenCasino();
    return this.guarded(() => repository.gameTerms(requireUserId(request)), {
      conflict: 'the casino terms are unavailable',
      forbidden: 'the casino terms are not yours to read',
    });
  }

  @Get('dice/fairness')
  @ApiOperation({ summary: 'Each dice game’s disclosed odds and the trial evidencing them' })
  async diceFairness() {
    const repository = await this.requireOpenCasino();
    return this.guarded(() => repository.diceFairness(), {
      conflict: 'the fairness evidence is unavailable',
      forbidden: 'the fairness evidence is not yours to read',
    });
  }

  /**
   * One roll, and it does not ask the switch first for exactly the reason the
   * coin's play route does not: `casino_play_dice` looks for an existing
   * receipt before it reads the switch, so closing the casino cannot turn a
   * member's in-flight retry into an error.
   */
  @Post('dice/plays')
  @ApiOperation({ summary: 'Stake WLD on one roll of the die' })
  async playDice(@Req() request: RequestWithSession, @Body() body: CasinoDicePlayDto) {
    const repository = this.repository();
    try {
      return await repository.playDice(
        body.idempotencyKey,
        requireUserId(request),
        body.game,
        body.choice,
        body.stake,
      );
    } catch (error: unknown) {
      if (isExpectedCommandFailure(error)) {
        const state = await repository.switchState();
        if (state !== CASINO_OPEN) throw casinoClosed(state);
      }
      throw this.mapped(error, {
        conflict: 'the roll was not accepted',
        forbidden: 'the roll was not yours to make',
      });
    }
  }

  /**
   * Answered from the request rather than read back, because nothing in the
   * schema can read `casino_self_limits`: 079 revokes the table from
   * moneyverse_app and 080 adds a writer and no reader. The write either
   * stored exactly these three values or it raised, so echoing them is a fact
   * rather than a guess -- and the amounts leave as strings, the way every
   * other amount in this API does.
   *
   * The keys are 079's own column names rather than the request's camelCase,
   * so that the day a read function exists this shape does not change under
   * whoever is already rendering it.
   */
  /**
   * Not behind the feature switch, unlike everything else here. A
   * self-exclusion is a protective control: refusing to let a member
   * strengthen one because the game is closed fails in the wrong direction,
   * and the switch is seeded off, so gating this would mean the table could
   * never receive a row at all. `member_set_casino_self_limit` agrees -- it
   * checks an active membership and deliberately does not read the switch.
   */
  @Put('self-limit')
  @ApiOperation({ summary: 'Set the daily caps and the lock the member holds themselves to' })
  async setSelfLimit(@Req() request: RequestWithSession, @Body() body: CasinoSelfLimitDto) {
    const repository = this.repository();
    await this.guarded(
      () =>
        repository.setSelfLimit(
          requireUserId(request),
          body.dailyBetLimit,
          body.dailyLossLimit,
          body.lockedUntil,
        ),
      {
        conflict: 'the self-limit was not changed',
        forbidden: 'an active membership is required to set a casino limit',
      },
    );
    return {
      daily_bet_limit: String(body.dailyBetLimit),
      daily_loss_limit: String(body.dailyLossLimit),
      locked_until: body.lockedUntil ?? null,
    };
  }


  @Get('history')
  @ApiOperation({ summary: "Read the current member's recent casino plays" })
  async history(@Req() request: RequestWithSession) {
    return this.guarded(() => this.repository().history(requireUserId(request)), {
      conflict: 'the casino history is unavailable',
      forbidden: 'an active membership is required to read casino history',
    });
  }

  @Get('self-limit')
  @ApiOperation({ summary: 'Read the daily limits chosen by the current member' })
  async selfLimit(@Req() request: RequestWithSession) {
    return this.guarded(() => this.repository().selfLimit(requireUserId(request)), {
      conflict: 'the self-limit is unavailable',
      forbidden: 'an active membership is required to read a casino limit',
    });
  }
}
