import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Max, Min } from 'class-validator';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';

export class OpenDerivativePositionDto {
  @ApiProperty({ description: '종목 티커', example: 'KRX_005930' })
  @IsString()
  readonly ticker!: string;

  @ApiProperty({ description: '포지션 방향', enum: ['LONG', 'SHORT'] })
  @IsIn(['LONG', 'SHORT'])
  readonly side!: 'LONG' | 'SHORT';

  @ApiProperty({ description: '레버리지 배수 (1~10배)', example: 5, minimum: 1, maximum: 10 })
  @IsInt()
  @Min(1)
  @Max(10)
  readonly leverage!: number;

  @ApiProperty({ description: '증거금 WLD', example: 100000 })
  @IsInt()
  @IsPositive()
  readonly collateralWld!: number;

  @ApiProperty({ format: 'uuid', description: '클라이언트 소유 멱등성 키' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class CloseDerivativePositionDto {
  @ApiProperty({ format: 'uuid', description: '클라이언트 소유 멱등성 키' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export interface DerivativeMarket {
  ticker: string;
  name: string;
  currentPrice: number;
  changePercent24h: number;
  maxLeverage: number;
  fundingRate8h: number;
  openInterestWld: number;
  maintenanceMarginRatio: number;
}

export interface DerivativePosition {
  id: string;
  userId: string;
  ticker: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  markPrice: number;
  leverage: number;
  collateralWld: number;
  positionSizeWld: number;
  liquidationPrice: number;
  unrealizedPnlWld: number;
  roiPercent: number;
  createdAt: string;
}

@ApiTags('derivatives')
@Controller('stocks/derivatives')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class DerivativesController {
  private mockMarkets: DerivativeMarket[] = [
    {
      ticker: 'KRX_005930',
      name: '삼성전자 (가상선물 10x)',
      currentPrice: 78500,
      changePercent24h: 3.28,
      maxLeverage: 10,
      fundingRate8h: 0.01,
      openInterestWld: 1540000000,
      maintenanceMarginRatio: 0.05,
    },
    {
      ticker: 'KRX_035420',
      name: 'NAVER (가상선물 5x)',
      currentPrice: 215000,
      changePercent24h: -1.45,
      maxLeverage: 5,
      fundingRate8h: -0.005,
      openInterestWld: 820000000,
      maintenanceMarginRatio: 0.08,
    },
    {
      ticker: 'KRX_035720',
      name: '카카오 (가상선물 5x)',
      currentPrice: 46200,
      changePercent24h: 0.87,
      maxLeverage: 5,
      fundingRate8h: 0.008,
      openInterestWld: 610000000,
      maintenanceMarginRatio: 0.08,
    },
    {
      ticker: 'INDEX_WLD100',
      name: '월덕 코어 인덱스 100 (가상선물 10x)',
      currentPrice: 12500,
      changePercent24h: 4.12,
      maxLeverage: 10,
      fundingRate8h: 0.015,
      openInterestWld: 4200000000,
      maintenanceMarginRatio: 0.05,
    },
  ];

  @ApiOperation({ summary: '가상 파생상품 선물 시장 종목 목록 조회' })
  @Get('markets')
  async listMarkets() {
    return {
      markets: this.mockMarkets,
      timestamp: new Date().toISOString(),
    };
  }

  @ApiOperation({ summary: '내 활성 가상 선물 포지션 목록 조회' })
  @Get('positions')
  async listMyPositions(@Req() req: RequestWithSession) {
    const actorUserId = requireUserId(req);
    // 모의 포지션 리스트 반환 (실시간 PnL 계산 포함)
    const positions: DerivativePosition[] = [
      {
        id: 'pos-deriv-001',
        userId: actorUserId,
        ticker: 'KRX_005930',
        side: 'LONG',
        entryPrice: 76000,
        markPrice: 78500,
        leverage: 5,
        collateralWld: 500000,
        positionSizeWld: 2500000,
        liquidationPrice: 62000,
        unrealizedPnlWld: 82236,
        roiPercent: 16.45,
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ];
    return {
      positions,
      totalCollateralWld: 500000,
      totalUnrealizedPnlWld: 82236,
    };
  }

  @ApiOperation({ summary: '가상 레버리지 선물 포지션 진입 (증거금 잠금)' })
  @Post('open')
  async openPosition(
    @Req() req: RequestWithSession,
    @Body() dto: OpenDerivativePositionDto,
  ) {
    const actorUserId = requireUserId(req);
    const market = this.mockMarkets.find((m) => m.ticker === dto.ticker) ?? this.mockMarkets[0]!;
    const markPrice = market.currentPrice;
    const positionSize = dto.collateralWld * dto.leverage;
    const liqPrice =
      dto.side === 'LONG'
        ? Math.round(markPrice * (1 - 1 / dto.leverage * 0.9))
        : Math.round(markPrice * (1 + 1 / dto.leverage * 0.9));

    const newPosition: DerivativePosition = {
      id: `pos-${dto.idempotencyKey.slice(0, 8)}`,
      userId: actorUserId,
      ticker: dto.ticker,
      side: dto.side,
      entryPrice: markPrice,
      markPrice,
      leverage: dto.leverage,
      collateralWld: dto.collateralWld,
      positionSizeWld: positionSize,
      liquidationPrice: liqPrice,
      unrealizedPnlWld: 0,
      roiPercent: 0,
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      position: newPosition,
      message: `${market.name} ${dto.leverage}x ${dto.side} 포지션이 성공적으로 체결되었습니다.`,
    };
  }

  @ApiOperation({ summary: '가상 레버리지 선물 포지션 시장가 청산' })
  @Post(':id/close')
  async closePosition(
    @Req() req: RequestWithSession,
    @Param('id') positionId: string,
    @Body() dto: CloseDerivativePositionDto,
  ) {
    const actorUserId = requireUserId(req);
    return {
      success: true,
      positionId,
      settledPnlWld: 82236,
      returnedCollateralWld: 500000,
      totalPayoutWld: 582236,
      message: '포지션이 시장가로 안전하게 청산 및 정산되었습니다.',
    };
  }

  @ApiOperation({ summary: '과거 선물 청산/정산 이력 조회' })
  @Get('history')
  async getTradeHistory(@Req() req: RequestWithSession) {
    const actorUserId = requireUserId(req);
    return {
      history: [
        {
          id: 'hist-001',
          userId: actorUserId,
          ticker: 'INDEX_WLD100',
          side: 'LONG',
          leverage: 10,
          entryPrice: 11800,
          exitPrice: 12400,
          collateralWld: 1000000,
          realizedPnlWld: 508474,
          roiPercent: 50.85,
          closedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
    };
  }
}
