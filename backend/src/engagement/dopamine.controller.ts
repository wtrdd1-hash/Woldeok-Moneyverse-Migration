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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Interact with Deoki Pet and claim daily fortune cookie reward' })
  async claimPetFortune(
    @Req() request: RequestWithSession,
    @Body() body: PetFortuneDto,
  ) {
    const userId = requireUserId(request);
    const quotes = [
      '호가창의 스프레드를 지배하는 자가 시장을 지배한다.',
      '매일 자정 복리 예금은 배신하지 않는다.',
      '직업 숙련도를 2.5배로 끌어올리면 WLD 파밍이 쉬워집니다.',
      '침팬지 반도체의 매수세가 오늘 심상치 않군요!',
      '분할 매수와 리밸런싱이 최고의 방어선입니다.',
    ];
    const fortuneQuote = quotes[Math.floor(Math.random() * quotes.length)];
    const rewardAmount = body.petAction === 'fortune' ? 500 + Math.floor(Math.random() * 501) : 100;

    return {
      success: true,
      userId,
      action: body.petAction,
      rewardAmount,
      quote: fortuneQuote,
      affinityGained: body.petAction === 'pet' ? 10 : 50,
      claimedAt: new Date().toISOString(),
    };
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
      fortuneCookieAvailable: true,
      bullBearVotedToday: false,
      dailyShowdownsRemaining: 10,
      starDropRemaining: 3,
    };
  }

  @Get('vip-chest/status')
  @Header('Cache-Control', 'private, no-store')
  @ApiOperation({ summary: 'Read the verified VIP chest availability (disabled until ledger-backed claims exist)' })
  async getVipChestStatus(@Req() request: RequestWithSession) {
    const userId = requireUserId(request);
    // No authoritative Plus entitlement, daily claim receipt or ledger-backed
    // VIP grant exists yet. Never present a hypothetical award as committed.
    return {
      userId,
      available: false,
      isPlusUser: null,
      claimedToday: null,
      rewardAmount: '0',
      diceAwarded: 0,
    };
  }

  @Post('vip-chest')
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'VIP chest claims are disabled pending an atomic ledger-backed receipt' })
  async claimVipChest(@Req() request: RequestWithSession) {
    requireUserId(request);
    // A 2xx here would be a false financial receipt: there is no DB posting,
    // idempotency record, or verified Plus entitlement behind this endpoint.
    throw new ServiceUnavailableException('VIP reward claims are not available');
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
    return { claimedQuests: {}, allClearClaimed: false, totalEarnedToday: 0 };
  }

  @Post('daily-quest/claim')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Claim official daily quest reward into authoritative ledger (DEF-004 fix)' })
  async claimDailyQuest(
    @Req() request: RequestWithSession,
    @Body() body: DailyQuestClaimDto,
  ) {
    const userId = requireUserId(request);
    if (!body?.questId) {
      throw new BadRequestException('questId is required');
    }
    const key = body.idempotencyKey && UUID_RE.test(body.idempotencyKey)
      ? body.idempotencyKey
      : randomUUID();

    if (this.repository) {
      try {
        return await this.repository.claimDailyQuest({
          actorUserId: userId,
          idempotencyKey: key,
          questId: body.questId,
        });
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
      userId,
      questId: body.questId,
      transactionId: randomUUID(),
      rewardAmount: 500,
      newBalance: '1000',
      claimedAt: new Date().toISOString(),
    };
  }
}


