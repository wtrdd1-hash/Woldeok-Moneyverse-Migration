import { randomUUID } from 'node:crypto';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  InternalServerErrorException,
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
import { DopamineRepository } from './dopamine.repository';

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
  @ApiOperation({ summary: 'Claim Golden Duck Fever clicking reward (up to 5,000 WLD)' })
  async claimGoldenDuck(
    @Req() request: RequestWithSession,
    @Body() body: GoldenDuckClaimDto,
  ) {
    const userId = requireUserId(request);
    const validClicks = Math.min(Math.max(1, body.clickCount || 1), 200);
    const validMultiplier = Math.min(Math.max(1.0, body.comboMultiplier || 1.0), 3.0);
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
        const msg = error instanceof Error ? error.message : String(error);
        throw new InternalServerErrorException(msg);
      }
    }

    // 저장소 미주입 환경 (테스트 등) 폴백
    const rewardAmount = Math.min(5000, Math.floor(validClicks * 25 * validMultiplier));
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
}

