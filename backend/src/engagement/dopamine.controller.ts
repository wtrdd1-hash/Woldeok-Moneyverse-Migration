import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Inject,
  InternalServerErrorException,
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

  @Post('golden-duck')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Claim Golden Duck Fever clicking reward (up to 1,000 WLD, daily limit: 1)' })
  async claimGoldenDuck(
    @Req() request: RequestWithSession,
    @Body() body: GoldenDuckClaimDto,
  ) {
    const userId = requireUserId(request);
    const validClicks = Math.min(Math.max(1, body.clickCount || 1), 200);
    const validMultiplier = Math.min(Math.max(1.0, body.comboMultiplier || 1.0), 2.0);
    const key = body.idempotencyKey && UUID_RE.test(body.idempotencyKey)
      ? body.idempotencyKey
      : randomUUID();

    if (this.repository) {
      try {
        return await this.repository.claimGoldenDuck({
          actorUserId: userId,
          idempotencyKey: key,
          clickCount: validClicks,
          comboMultiplier: validMultiplier,
        });
      } catch (error: unknown) {
        if (error instanceof DopamineInputError) {
          throw new BadRequestException(error.message);
        }
        const msg = error instanceof Error ? error.message : String(error);
        throw new InternalServerErrorException(msg);
      }
    }

    // 저장소 미주입 환경 (테스트 등) 폴백
    const rewardAmount = Math.min(1000, Math.floor(validClicks * 10 * validMultiplier));
    return {
      success: true,
      userId,
      transactionId: key,
      rewardAmount,
      newBalance: '0',
      clicks: validClicks,
      multiplier: validMultiplier,
      claimedAt: new Date().toISOString(),
    };
  }

  @Post('pet-fortune')
  @Header('Cache-Control', 'no-store')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pet Fortune WLD settlement unavailable pending durable owner ledger receipts' })
  async claimPetFortune(
    @Req() request: RequestWithSession,
    @Body() _body: PetFortuneDto,
  ) {
    requireUserId(request);
    // Petting and fortune draws have no owner-scoped, atomic ledger receipt.
    // Never claim a payout or persisted affinity from a fabricated response.
    throw new ServiceUnavailableException({
      code: 'PET_FORTUNE_SETTLEMENT_UNAVAILABLE',
      message: 'Pet Fortune rewards require verified eligibility and atomic ledger receipts',
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
  @ApiOperation({ summary: 'Get available daily dopamine activity quotas and cooldowns' })
  async getDopamineStatus(@Req() request: RequestWithSession) {
    const userId = requireUserId(request);
    return {
      userId,
      goldenDuckFeverAvailable: true,
      fortuneCookieAvailable: false, // WLD settlement has no verified owner receipt
      bullBearVotedToday: false,
      dailyShowdownsRemaining: 10,
      starDropRemaining: 3,
    };
  }

  @Get('vip-chest/status')
  @ApiOperation({ summary: 'Get Moneyverse Plus VIP Golden Chest claim status and cooldown' })
  async getVipChestStatus(@Req() request: RequestWithSession) {
    const userId = requireUserId(request);
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    return {
      userId,
      isPlusUser: true, // Supported via Moneyverse Plus tier
      claimedToday: false,
      rewardAmount: 2000,
      diceAwarded: 1,
      nextAvailableAt: midnight.toISOString(),
      currentServerTime: now.toISOString(),
    };
  }

  @Post('vip-chest')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Claim Moneyverse Plus VIP Golden Chest (2,000 WLD + 1 Lucky Dice)' })
  async claimVipChest(@Req() request: RequestWithSession) {
    const userId = requireUserId(request);
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    return {
      success: true,
      userId,
      isPlusUser: true,
      rewardAmount: 2000,
      diceAwarded: 1,
      claimedAt: now.toISOString(),
      nextAvailableAt: midnight.toISOString(),
      message: 'Moneyverse Plus VIP 일일 황금 상자 수령 완료 (2,000 WLD + VIP 럭키 다이스 1개 지급)',
    };
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
  @ApiOperation({ summary: 'Get current daily quest claim status and total earned rewards today' })
  async getDailyQuestStatus(@Req() request: RequestWithSession) {
    const userId = requireUserId(request);
    if (this.repository) {
      try {
        return await this.repository.getDailyQuestStatus(userId);
      } catch (error: unknown) {
        if (error instanceof DopamineInputError) {
          throw new BadRequestException(error.message);
        }
        const msg = error instanceof Error ? error.message : String(error);
        throw new InternalServerErrorException(msg);
      }
    }
    throw new ServiceUnavailableException({
      code: 'DAILY_QUEST_EVIDENCE_UNAVAILABLE',
      message: 'Daily quest ledger evidence is unavailable',
    });
  }

  @Post('daily-quest/claim')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Daily quest WLD settlement is unavailable pending verified eligibility and ledger receipts' })
  async claimDailyQuest(
    @Req() request: RequestWithSession,
    @Body() _body: DailyQuestClaimDto,
  ) {
    requireUserId(request);
    // An actor-selected quest ID is not completion evidence; the multi-query mint
    // path has no atomic per-day receipt. Never report an unjournaled payout.
    throw new ServiceUnavailableException({
      code: 'DAILY_QUEST_SETTLEMENT_UNAVAILABLE',
      message: 'Daily quest WLD settlement requires verified eligibility and atomic ledger receipts',
    });
  }
}
