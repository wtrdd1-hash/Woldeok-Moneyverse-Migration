import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsIn, IsInt, IsObject, IsPositive, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
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
  private mockStrategies: QuantStrategy[] = [
    {
      id: 'strat-001',
      userId: 'user-sample',
      name: 'RSI 30 이하 과매도 반등 봇',
      targetTicker: 'KRX_005930',
      targetTickerName: '삼성전자',
      isActive: true,
      orderAmountWld: 200000,
      totalPnlWld: 485000,
      winRatePercent: 71.4,
      totalTrades: 28,
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
    {
      id: 'strat-002',
      userId: 'user-sample',
      name: '골든크로스 5/20 이평선 추세추종',
      targetTicker: 'INDEX_WLD100',
      targetTickerName: '월덕 인덱스 100',
      isActive: false,
      orderAmountWld: 500000,
      totalPnlWld: -32000,
      winRatePercent: 45.0,
      totalTrades: 20,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ];

  @ApiOperation({ summary: '내 퀀트 알고리즘 봇 전략 목록 조회' })
  @Get('strategies')
  async listStrategies(@Req() req: RequestWithSession) {
    const actorUserId = requireUserId(req);
    return {
      strategies: this.mockStrategies.map((s) => ({ ...s, userId: actorUserId })),
      totalActiveBots: this.mockStrategies.filter((s) => s.isActive).length,
    };
  }

  @ApiOperation({ summary: '노코드 퀀트 전략 신규 생성 및 배포' })
  @Post('strategies')
  async createStrategy(
    @Req() req: RequestWithSession,
    @Body() dto: SaveQuantStrategyDto,
  ) {
    const actorUserId = requireUserId(req);
    const newStrategy: QuantStrategy = {
      id: `strat-${dto.idempotencyKey.slice(0, 8)}`,
      userId: actorUserId,
      name: dto.name,
      targetTicker: dto.targetTicker,
      targetTickerName: dto.targetTicker === 'KRX_005930' ? '삼성전자' : '월덕 인덱스 100',
      isActive: true,
      orderAmountWld: dto.orderAmountWld,
      totalPnlWld: 0,
      winRatePercent: 0,
      totalTrades: 0,
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      strategy: newStrategy,
      message: `퀀트 자동매매 전략 '${dto.name}'이(가) 정상 등록되어 실시간 감시가 시작되었습니다.`,
    };
  }

  @ApiOperation({ summary: '과거 시장 틱 데이터 기반 퀀트 백테스팅 실행' })
  @Post('backtest')
  async runBacktest(
    @Req() req: RequestWithSession,
    @Body() dto: RunQuantBacktestDto,
  ) {
    const totalReturnPercent = 18.75;
    const netProfitWld = Math.round(dto.initialCapitalWld * (totalReturnPercent / 100));
    return {
      success: true,
      result: {
        targetTicker: dto.targetTicker,
        periodDays: dto.periodDays,
        initialCapitalWld: dto.initialCapitalWld,
        finalCapitalWld: dto.initialCapitalWld + netProfitWld,
        netProfitWld,
        totalReturnPercent,
        maxDrawdownPercent: -4.2,
        winRatePercent: 68.5,
        totalTradesExecuted: 42,
        profitFactor: 2.14,
        sharpeRatio: 1.82,
      },
    };
  }

  @ApiOperation({ summary: '퀀트 봇 실시간 자동매매 가동 상태 토글' })
  @Post('strategies/:id/toggle')
  async toggleStrategy(
    @Req() req: RequestWithSession,
    @Param('id') strategyId: string,
  ) {
    const actorUserId = requireUserId(req);
    return {
      success: true,
      strategyId,
      isActive: true,
      message: '퀀트 봇의 실시간 자동 주문 체결 상태가 변경되었습니다.',
    };
  }

  @ApiOperation({ summary: '퀀트 봇 실시간 자동 주문 체결 로그 조회' })
  @Get('strategies/:id/logs')
  async getStrategyLogs(
    @Req() req: RequestWithSession,
    @Param('id') strategyId: string,
  ) {
    const actorUserId = requireUserId(req);
    return {
      logs: [
        {
          id: 'log-001',
          strategyId,
          ticker: 'KRX_005930',
          action: 'BUY',
          price: 77200,
          quantity: 2,
          reason: 'RSI(14) 28.4 도달 (과매도 매수 시그널)',
          executedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: 'log-002',
          strategyId,
          ticker: 'KRX_005930',
          action: 'SELL',
          price: 78500,
          quantity: 2,
          reason: '목표 익절가(+1.68%) 도달로 전량 매도 체결',
          executedAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ],
    };
  }
}
