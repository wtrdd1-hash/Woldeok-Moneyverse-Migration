import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  ServiceUnavailableException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Max, Min } from 'class-validator';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';

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
      simulated: true,
      timestamp: new Date().toISOString(),
    };
  }

  @ApiOperation({ summary: '내 활성 가상 선물 포지션 목록 조회' })
  @Get('positions')
  async listMyPositions(@Req() _req: RequestWithSession) {
    // No authoritative derivatives ledger exists. Never bind demo rows to a real member.
    throw new ServiceUnavailableException('파생상품 보유 기록 조회는 원장 검증 전까지 지원되지 않습니다.');
  }

  @ApiOperation({ summary: '가상 레버리지 선물 포지션 진입 (증거금 잠금)' })
  @Post('open')
  async openPosition(
    @Req() req: RequestWithSession,
    @Body() dto: OpenDerivativePositionDto,
  ) {
    throw new ServiceUnavailableException('시뮬레이션 기능입니다. 실제 자금 정산 및 상태 변경은 지원되지 않습니다.');
  }

  @ApiOperation({ summary: '가상 레버리지 선물 포지션 시장가 청산' })
  @Post(':id/close')
  async closePosition(
    @Req() req: RequestWithSession,
    @Param('id') positionId: string,
    @Body() dto: CloseDerivativePositionDto,
  ) {
    throw new ServiceUnavailableException('시뮬레이션 기능입니다. 실제 자금 정산 및 상태 변경은 지원되지 않습니다.');
  }

  @ApiOperation({ summary: '과거 선물 청산/정산 이력 조회' })
  @Get('history')
  async getTradeHistory(@Req() _req: RequestWithSession) {
    // A synthetic settlement must not be represented as a member's trade history.
    throw new ServiceUnavailableException('파생상품 정산 이력은 원장 검증 전까지 지원되지 않습니다.');
  }
}
