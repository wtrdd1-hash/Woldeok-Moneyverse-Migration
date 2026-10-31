import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  ServiceUnavailableException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsIn, IsInt, IsPositive, IsString, IsUUID, Max, Min } from 'class-validator';
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
  private unverifiedData(): never {
    // No canonical derivatives ledger or market feed backs these endpoints.
    // Returning demo records as member balances or prices would be financial misinformation.
    throw new ServiceUnavailableException({
      code: 'DERIVATIVES_DATA_UNVERIFIED',
      message: 'Verified derivatives market, positions and history are not available.',
    });
  }

  @ApiOperation({ summary: 'Verified derivatives market data (unavailable pending source certification)' })
  @ApiResponse({ status: 503, description: 'No authoritative derivatives market feed is configured.' })
  @Get('markets')
  listMarkets(): never {
    return this.unverifiedData();
  }

  @ApiOperation({ summary: 'Verified member derivatives positions (unavailable pending ledger certification)' })
  @ApiResponse({ status: 503, description: 'No authoritative derivatives positions ledger is configured.' })
  @Get('positions')
  listMyPositions(): never {
    return this.unverifiedData();
  }

  @ApiOperation({ summary: '가상 레버리지 선물 포지션 진입 (증거금 잠금)' })
  @Post('open')
  async openPosition(
    @Req() _req: RequestWithSession,
    @Body() _dto: OpenDerivativePositionDto,
  ) {
    return this.unverifiedData();
  }

  @ApiOperation({ summary: '가상 레버리지 선물 포지션 시장가 청산' })
  @Post(':id/close')
  async closePosition(
    @Req() _req: RequestWithSession,
    @Param('id') _positionId: string,
    @Body() _dto: CloseDerivativePositionDto,
  ) {
    return this.unverifiedData();
  }

  @ApiOperation({ summary: 'Verified derivatives settlement history (unavailable pending ledger certification)' })
  @ApiResponse({ status: 503, description: 'No authoritative derivatives settlement history is configured.' })
  @Get('history')
  getTradeHistory(): never {
    return this.unverifiedData();
  }
}
