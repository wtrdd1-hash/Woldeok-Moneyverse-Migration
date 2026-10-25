import {
  Body,
  Controller,
  Get,
  Param,
  Header,
  Post,
  ServiceUnavailableException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsInt, IsObject, IsPositive, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';

export class SaveQuantStrategyDto {
  @ApiProperty({ description: '전략 이름', example: 'RSI 볼린저밴드 하이브리드 돌파' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  readonly name!: string;

  @ApiProperty({ description: '적용 타겟 종목 티커', example: 'KRX_005930' })
  @IsString()
  readonly targetTicker!: string;

  @ApiProperty({ description: '매수/매도 알고리즘 조건식 JSON' })
  @IsObject()
  readonly ruleLogic!: Record<string, unknown>;

  @ApiProperty({ description: '1회 주문당 투입 WLD 금액', example: 100000 })
  @IsInt()
  @IsPositive()
  readonly orderAmountWld!: number;

  @ApiProperty({ description: '손절 기준 퍼센트 (-10% ~ -1%)', example: -5 })
  @IsInt()
  readonly stopLossPercent!: number;

  @ApiProperty({ description: '익절 기준 퍼센트 (1% ~ 50%)', example: 10 })
  @IsInt()
  @IsPositive()
  readonly takeProfitPercent!: number;

  @ApiProperty({ format: 'uuid', description: '클라이언트 소유 멱등성 키' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class RunQuantBacktestDto {
  @ApiProperty({ description: '적용 타겟 종목 티커', example: 'KRX_005930' })
  @IsString()
  readonly targetTicker!: string;

  @ApiProperty({ description: '백테스트 기간 일수 (7, 14, 30일)', example: 30 })
  @IsInt()
  @IsPositive()
  readonly periodDays!: number;

  @ApiProperty({ description: '매수/매도 알고리즘 조건식 JSON' })
  @IsObject()
  readonly ruleLogic!: Record<string, unknown>;

  @ApiProperty({ description: '시뮬레이션 초기 자본 (WLD)', example: 10000000 })
  @IsInt()
  @IsPositive()
  readonly initialCapitalWld!: number;
}

export interface QuantStrategy {
  id: string;
  userId: string;
  name: string;
  targetTicker: string;
  targetTickerName: string;
  isActive: boolean;
  orderAmountWld: number;
  totalPnlWld: number;
  winRatePercent: number;
  totalTrades: number;
  createdAt: string;
}

@ApiTags('quant')
@Controller('quant')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class QuantController {
  private unavailable(): never {
    // No authoritative strategy store, execution ledger or historical price feed exists.
    throw new ServiceUnavailableException({
      code: 'QUANT_EVIDENCE_UNAVAILABLE',
      message: 'Verified quant strategy, execution and backtest evidence is unavailable.',
    });
  }

  @ApiOperation({ summary: '내 퀀트 알고리즘 봇 전략 목록 조회' })
  @Get('strategies')
  @Header('Cache-Control', 'no-store')
  async listStrategies(@Req() req: RequestWithSession) {
    requireUserId(req);
    return this.unavailable();
  }

  @ApiOperation({ summary: '노코드 퀀트 전략 신규 생성 및 배포' })
  @Post('strategies')
  async createStrategy(
    @Req() req: RequestWithSession,
    @Body() dto: SaveQuantStrategyDto,
  ) {
    throw new ServiceUnavailableException('시뮬레이션 기능입니다. 실제 자금 정산 및 상태 변경은 지원되지 않습니다.');
  }

  @ApiOperation({ summary: '검증된 과거 가격 데이터 부재 시 퀀트 백테스트 차단' })
  @Post('backtest')
  @Header('Cache-Control', 'no-store')
  async runBacktest(
    @Req() req: RequestWithSession,
    @Body() dto: RunQuantBacktestDto,
  ) {
    requireUserId(req);
    return this.unavailable();
  }

  @ApiOperation({ summary: '퀀트 봇 실시간 자동매매 가동 상태 토글' })
  @Post('strategies/:id/toggle')
  async toggleStrategy(
    @Req() req: RequestWithSession,
    @Param('id') strategyId: string,
  ) {
    throw new ServiceUnavailableException('시뮬레이션 기능입니다. 실제 자금 정산 및 상태 변경은 지원되지 않습니다.');
  }

  @ApiOperation({ summary: '검증된 퀀트 자동 주문 체결 기록 부재 시 조회 차단' })
  @Get('strategies/:id/logs')
  @Header('Cache-Control', 'no-store')
  async getStrategyLogs(
    @Req() req: RequestWithSession,
    @Param('id') strategyId: string,
  ) {
    requireUserId(req);
    return this.unavailable();
  }
}
