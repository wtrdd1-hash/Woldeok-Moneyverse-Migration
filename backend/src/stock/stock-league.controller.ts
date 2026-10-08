import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
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
import { StockLeagueInputError, StockLeagueRepository } from './stock-league.repository';

export interface SubscribeCopyTradingDto {
  readonly whaleId: string;
  readonly whaleName: string;
  readonly allocatedBudget: number;
  readonly copyRatio?: number;
}

export interface CancelCopyTradingDto {
  readonly whaleId: string;
}

@ApiTags('stocks-league')
@Controller('stocks/league')
export class StockLeagueController {
  constructor(
    @Inject(StockLeagueRepository) private readonly repository: StockLeagueRepository | null,
  ) {}

  @Get('current')
  @ApiOperation({ summary: '현재 진행 중인 주식 챔피언십 리그 현황 및 리더보드, 고래 트레이더 목록 조회' })
  async getCurrentLeague(@Req() req: RequestWithSession) {
    if (!this.repository) {
      throw new BadRequestException('주식 챔피언십 리그 시스템이 현재 점검 중입니다.');
    }

    const currentSeason = await this.repository.getCurrentSeason();
    if (!currentSeason) {
      return {
        success: true,
        season: null,
        leaderboard: [],
        whales: [],
        myParticipation: null,
        mySubscriptions: [],
      };
    }

    const [leaderboard, whales] = await Promise.all([
      this.repository.getLeaderboard(currentSeason.id, 20),
      this.repository.getWhales(10),
    ]);

    const currentUserId = req.session?.user_id;
    let myParticipation = null;
    let mySubscriptions: any[] = [];

    if (currentUserId) {
      const myRank = leaderboard.find((p) => p.userId === currentUserId);
      if (myRank) {
        myParticipation = myRank;
      }
      mySubscriptions = await this.repository.getMySubscriptions(currentUserId);
    }

    return {
      success: true,
      season: currentSeason,
      leaderboard,
      whales,
      myParticipation,
      mySubscriptions,
    };
  }

  @Post('join')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiOperation({ summary: '주식 챔피언십 리그 참가 신청' })
  async joinLeague(@Req() req: RequestWithSession) {
    if (!this.repository) {
      throw new BadRequestException('주식 챔피언십 리그 시스템이 현재 점검 중입니다.');
    }
    const userId = requireUserId(req);
    const userName = '트레이더';

    try {
      const participation = await this.repository.joinSeason(userId, userName);
      return {
        success: true,
        participation,
        message: '제1회 월덱 가상주식 챔피언십 리그에 성공적으로 참가 등록되었습니다!',
      };
    } catch (err: any) {
      if (err instanceof StockLeagueInputError) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  @Post('copy-trade/subscribe')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiOperation({ summary: '상위 고래 트레이더 카피 트레이딩 구독' })
  async subscribeCopyTrading(@Req() req: RequestWithSession, @Body() body: SubscribeCopyTradingDto) {
    if (!this.repository) {
      throw new BadRequestException('주식 챔피언십 리그 시스템이 현재 점검 중입니다.');
    }
    const userId = requireUserId(req);
    const userName = '구독자';

    if (!body.whaleId) {
      throw new BadRequestException('구독할 고래 트레이더 ID가 필요합니다.');
    }
    if (!body.allocatedBudget || body.allocatedBudget < 10000) {
      throw new BadRequestException('최소 10,000 WLD 이상의 자본금을 할당해야 합니다.');
    }

    try {
      const subscription = await this.repository.subscribeCopyTrading(
        userId,
        userName,
        body.whaleId,
        body.whaleName || '고래 트레이더',
        body.allocatedBudget,
        body.copyRatio ?? 1.0
      );
      return {
        success: true,
        subscription,
        message: `${body.whaleName || '고래'} 트레이더의 실전 카피 트레이딩이 활성화되었습니다!`,
      };
    } catch (err: any) {
      if (err instanceof StockLeagueInputError) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  @Post('copy-trade/cancel')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiOperation({ summary: '고래 트레이더 카피 트레이딩 구독 해제' })
  async cancelCopyTrading(@Req() req: RequestWithSession, @Body() body: CancelCopyTradingDto) {
    if (!this.repository) {
      throw new BadRequestException('주식 챔피언십 리그 시스템이 현재 점검 중입니다.');
    }
    const userId = requireUserId(req);
    if (!body.whaleId) {
      throw new BadRequestException('해제할 고래 트레이더 ID가 필요합니다.');
    }

    const cancelled = await this.repository.cancelCopyTrading(userId, body.whaleId);
    return {
      success: true,
      cancelled,
      message: cancelled ? '카피 트레이딩 구독이 안전하게 해제되었습니다.' : '구독 내역을 찾을 수 없습니다.',
    };
  }
}
