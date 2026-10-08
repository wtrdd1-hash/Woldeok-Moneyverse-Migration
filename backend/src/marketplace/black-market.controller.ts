import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
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
import { BlackMarketInputError, BlackMarketRepository } from './black-market.repository';

export interface PlaceBidDto {
  readonly bidAmount: number;
}

@ApiTags('black-market')
@Controller('market/secret-auction')
export class BlackMarketController {
  constructor(
    @Inject(BlackMarketRepository) private readonly repository: BlackMarketRepository | null,
  ) {}

  @Get('active')
  @ApiOperation({ summary: '현재 진행 중인 심야 비밀 암시장 경매 목록 조회' })
  async getActiveAuctions(@Req() req: RequestWithSession) {
    if (!this.repository) {
      throw new BadRequestException('비밀 암시장 시스템이 점검 중입니다.');
    }
    const currentUserId = req?.session?.user_id;
    const auctions = await this.repository.listAuctions(currentUserId);
    return {
      success: true,
      auctions,
    };
  }

  @Get(':auctionId/logs')
  @ApiOperation({ summary: '특정 암시장 경매의 최근 입찰 로그 조회' })
  async getBidLogs(@Param('auctionId') auctionId: string) {
    if (!this.repository) {
      throw new BadRequestException('비밀 암시장 시스템이 점검 중입니다.');
    }
    const logs = await this.repository.getBidLogs(auctionId, 20);
    return {
      success: true,
      logs,
    };
  }

  @Post(':auctionId/bid')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiOperation({ summary: '비밀 암시장 호가 입찰 실행' })
  async placeBid(
    @Req() req: RequestWithSession,
    @Param('auctionId') auctionId: string,
    @Body() body: PlaceBidDto,
  ) {
    if (!this.repository) {
      throw new BadRequestException('비밀 암시장 시스템이 점검 중입니다.');
    }
    const userId = requireUserId(req);
    try {
      const result = await this.repository.placeBid(auctionId, userId, body.bidAmount);
      return {
        success: true,
        ...result,
      };
    } catch (err: any) {
      if (err instanceof BlackMarketInputError) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }
}
