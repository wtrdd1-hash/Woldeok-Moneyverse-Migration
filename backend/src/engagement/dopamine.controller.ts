import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  Header,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { DopamineInputError, DopamineRepository } from './dopamine.repository';

export interface GoldenDuckClaimDto {
  readonly clickCount: number;
  readonly comboMultiplier: number;
  readonly idempotencyKey?: string;
}

export interface PetFortuneDto {
  readonly petAction: 'pet' | 'fortune';
  readonly idempotencyKey: string;
}

export interface BullBearVoteDto {
  readonly vote: 'bull' | 'bear';
  readonly stockSymbol?: string;
}

export interface MiniShowdownDto {
  readonly outcome: 'win' | 'loss';
  readonly playerRoll: readonly number[];
  readonly aiRoll: readonly number[];
  readonly stake?: number;
}

export interface StarDropClaimDto {
  readonly tapTier: 'rare' | 'epic' | 'legendary' | 'mythic';
  readonly idempotencyKey: string;
}

export interface DailyQuestClaimDto {
  readonly questId: string;
  readonly idempotencyKey?: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@ApiTags('dopamine')
@Controller('engagement/dopamine')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
export class DopamineController {
  constructor(
    @Inject(DopamineRepository) private readonly repository: DopamineRepository | null,
  ) {}

  /**
   * Only a posted owner cash credit counts as historical reward evidence.
   * The old click-count-driven mint path has no atomic daily cap and must
   * remain unreachable until a reviewed DB-owned settlement migration ships.
   */
  @Get('golden-duck/status')
  @Header('Cache-Control', 'private, no-store')
  @ApiOperation({ summary: 'Read owner-verified Golden Duck ledger history; reward claims are held' })
  async getGoldenDuckLedgerStatus(@Req() request: RequestWithSession) {
    const userId = requireUserId(request);
    if (!this.repository) throw new ServiceUnavailableException('golden duck ledger status unavailable');
    try {
      const evidence = await this.repository.goldenDuckLedgerStatus(userId);
      return { ...evidence, rewardClaimsEnabled: false };
    } catch {
      throw new ServiceUnavailableException('golden duck ledger status unavailable');
    }
  }

  @Post('golden-duck')
  @Header('Cache-Control', 'private, no-store')
  @ApiOperation({ summary: 'Golden Duck WLD claims held until atomic ledger-backed settlement exists' })
  async claimGoldenDuck(@Req() request: RequestWithSession, @Body() _body: GoldenDuckClaimDto) {
    requireUserId(request);
    throw new ServiceUnavailableException({
      code: 'golden_duck_settlement_unavailable',
      message: 'Golden Duck practice awards no WLD; ledger-backed rewards are unavailable',
    });
  }

  @Post('pet-fortune')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Deoki Pet and Fortune WLD settlement is unavailable pending ledger receipts' })
  async claimPetFortune(
    @Req() request: RequestWithSession,
    @Body() _body: PetFortuneDto,
  ) {
    requireUserId(request);
    // Practice happens locally; no ledger-backed, idempotent reward exists.
    throw new ServiceUnavailableException({
      code: 'PET_FORTUNE_SETTLEMENT_UNAVAILABLE',
      message: 'Pet and fortune WLD rewards are unavailable without a verified ledger settlement',
    });
  }

  @Post('bull-bear-vote')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vote on Bull/Bear market sentiment and join 10,000 WLD midnight pool' })
  async voteBullBear(
    @Req() request: RequestWithSession,
    @Body() body: BullBearVoteDto,
  ) {
    const userId = requireUserId(request);
    return {
      success: true,
      userId,
      vote: body.vote,
      stockSymbol: body.stockSymbol || 'MARKET_OVERALL',
      poolEligible: true,
      airdropPoolWld: 10000,
      settlementTime: '00:00:00 KST',
    };
  }

  @Post('mini-showdown')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve 1:1 Instant Dice Showdown against AI' })
  async resolveMiniShowdown(
    @Req() request: RequestWithSession,
    @Body() body: MiniShowdownDto,
  ) {
    const userId = requireUserId(request);
    const stake = body.stake ?? 100;
    const isWin = body.outcome === 'win';
    const rewardAmount = isWin ? Math.floor(stake * 1.9) : 0;

    return {
      success: true,
      userId,
      outcome: body.outcome,
      stake,
      payout: rewardAmount,
      playerRoll: body.playerRoll,
      aiRoll: body.aiRoll,
      resolvedAt: new Date().toISOString(),
    };
  }

  @Post('star-drop')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Claim Star Drop 5-tap upgrade tier reward' })
  async claimStarDrop(
    @Req() request: RequestWithSession,
    @Body() body: StarDropClaimDto,
  ) {
    const userId = requireUserId(request);
    const tierRewards = {
      rare: 1000,
      epic: 2500,
      legendary: 5000,
      mythic: 10000,
    };
    const rewardAmount = tierRewards[body.tapTier] || 1000;

    return {
      success: true,
      userId,
      tier: body.tapTier,
      rewardAmount,
      claimedAt: new Date().toISOString(),
    };
  }

  @Get('status')
  @Header('Cache-Control', 'private, no-store')
  @ApiOperation({ summary: 'Get available daily dopamine activity quotas and cooldowns' })
  async getDopamineStatus(@Req() request: RequestWithSession) {
    const userId = requireUserId(request);
    return {
      userId,
      goldenDuckFeverAvailable: false,
      fortuneCookieAvailable: false,
      bullBearVotedToday: false,
      dailyShowdownsRemaining: 10,
      starDropRemaining: 3,
    };
  }

  @Get('vip-chest/status')
  @ApiOperation({ summary: 'Report VIP chest availability without claiming unverified rewards' })
  async getVipChestStatus(@Req() request: RequestWithSession) {
    const userId = requireUserId(request);
    // No verified Plus entitlement, idempotent ledger posting or dice receipt
    // exists for this reward. A static success response would invent assets.
    return {
      userId,
      available: false,
      isPlusUser: null,
      claimedToday: null,
      rewardAmount: '0',
      diceAwarded: 0,
      nextAvailableAt: null,
      reason: 'unverified_entitlement_and_ledger_receipt',
    };
  }

  @Post('vip-chest')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'VIP chest claims unavailable pending verified ledger and entitlement' })
  async claimVipChest(@Req() request: RequestWithSession): Promise<never> {
    requireUserId(request);
    throw new ServiceUnavailableException('VIP chest claims require verified entitlement and an atomic ledger receipt.');
  }

  @Get('attendance/status')
  @ApiOperation({ summary: 'Get daily attendance streak and lucky roulette status' })
  async getAttendanceStatus(@Req() request: RequestWithSession) {
    const userId = requireUserId(request);
    if (this.repository) {
      return await this.repository.getAttendanceStatus(userId);
    }
    return {
      checkedInToday: false,
      streakDays: 1,
      lastAttendedDate: null,
      nextRewardPreview: 50,
      isJackpotEligible: false,
    };
  }

  @Post('attendance/spin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Claim daily attendance reward and spin the lucky dopamine roulette' })
  async claimAttendanceSpin(
    @Req() request: RequestWithSession,
    @Body() body: { idempotencyKey?: string },
  ) {
    const userId = requireUserId(request);
    const key = body.idempotencyKey && UUID_RE.test(body.idempotencyKey)
      ? body.idempotencyKey
      : randomUUID();

    if (this.repository) {
      try {
        return await this.repository.claimAttendanceSpin(userId, key);
      } catch (error: unknown) {
        if (error instanceof DopamineInputError) {
          throw new BadRequestException(error.message);
        }
        const msg = error instanceof Error ? error.message : String(error);
        throw new InternalServerErrorException(msg);
      }
    }

    return {
      success: true,
      rewardAmount: 50,
      streakDays: 1,
      isJackpot: false,
      newBalance: '1000',
      claimedAt: new Date().toISOString(),
    };
  }

  @Get('daily-quest/status')
  @Header('Cache-Control', 'private, no-store')
  @ApiOperation({ summary: 'Read ledger-backed daily quest history; unverified reward claims are held' })
  async getDailyQuestStatus(@Req() request: RequestWithSession) {
    const userId = requireUserId(request);
    if (!this.repository) {
      throw new ServiceUnavailableException({
        code: 'DAILY_QUEST_EVIDENCE_UNAVAILABLE',
        message: 'Daily quest ledger evidence is unavailable',
      });
    }
    try {
      return await this.repository.getDailyQuestStatus(userId);
    } catch (error: unknown) {
      if (error instanceof DopamineInputError) {
        throw new BadRequestException(error.message);
      }
      throw new ServiceUnavailableException({
        code: 'DAILY_QUEST_EVIDENCE_UNAVAILABLE',
        message: 'Daily quest ledger evidence is unavailable',
      });
    }
  }

  @Post('daily-quest/claim')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'private, no-store')
  @ApiOperation({ summary: 'Daily quest WLD settlement is held until verified eligibility and atomic ledger receipts exist' })
  async claimDailyQuest(
    @Req() request: RequestWithSession,
    @Body() _body: DailyQuestClaimDto,
  ) {
    requireUserId(request);
    // A caller-supplied quest ID cannot attest completion, and the former
    // multi-query mint path lacks an atomic per-day settlement receipt.
    throw new ServiceUnavailableException({
      code: 'DAILY_QUEST_SETTLEMENT_UNAVAILABLE',
      message: 'Daily quest WLD settlement requires verified eligibility and atomic ledger receipts',
    });
  }

}


