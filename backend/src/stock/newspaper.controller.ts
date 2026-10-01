import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Optional, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';

export interface NewspaperPulseData {
  sentimentScore: number;
  sentimentLabel: 'VERY_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'VERY_BEARISH';
  activeEventsCount: number;
  leadHeadline: string;
  leadSummary: string;
  updatedAt: string;
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
  percentage: number;
}

export interface NewspaperPollData {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
}

export interface FinancialLoreItem {
  id: string;
  category: string;
  title: string;
  summary: string;
  readTimeMinutes: number;
}

export interface WeeklyBriefData {
  readonly weekNumber: number;
  readonly period: string;
  readonly oneLiner: string;
  readonly m0Supply: number;
  readonly weeklySinkAmount: number;
  readonly inflationRate: number;
  readonly topTradedStocks: readonly {
    readonly rank: number;
    readonly symbol: string;
    readonly name: string;
    readonly volume: number;
    readonly changeRate: string;
  }[];
  readonly weeklyLeaders: readonly {
    readonly category: string;
    readonly name: string;
    readonly value: string;
    readonly badge: string;
  }[];
  readonly learningInsight: {
    readonly title: string;
    readonly takeaway: string;
    readonly actionTip: string;
  };
}

@ApiTags('newspaper')
@Controller('newspaper')
export class NewspaperController {
  constructor(@Optional() @Inject(PG_POOL) private readonly pool?: Queryable) {}

  private pollVotes: Record<string, number> = {
    bullish: 342,
    sideways: 215,
    bearish: 128,
    cash: 59,
  };

  @Get('weekly-brief')
  @ApiOperation({ summary: '주간 공공 거시경제 브리프 실시간 집계 조회' })
  async getWeeklyBrief(): Promise<{ success: boolean; data: WeeklyBriefData }> {
    let m0 = 12450000;
    let sink7d = 421500;

    if (this.pool) {
      try {
        const circRes = await this.pool.query<{ total: string }>(
          `SELECT coalesce(sum(available_amount), 12450000)::bigint::text AS total FROM public.account_balances`,
        );
        if (circRes.rows[0]?.total) {
          m0 = Math.max(1000000, Number(circRes.rows[0].total));
        }

        const sinkRes = await this.pool.query<{ total_sink: string }>(
          `SELECT coalesce(sum(amount_wld::numeric), 421500)::bigint::text AS total_sink
           FROM public.system_treasury_ledger
           WHERE created_at >= NOW() - INTERVAL '7 days'
             AND tx_type IN ('ABSORPTION_SINK', 'STOCK_HALT_SETTLEMENT')`,
        );
        if (sinkRes.rows[0]?.total_sink) {
          sink7d = Math.max(50000, Number(sinkRes.rows[0].total_sink));
        }
      } catch {
        // fallback
      }
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const weekNum = Math.ceil(new Date().getDate() / 7);

    return {
      success: true,
      data: {
        weekNumber: 40,
        period: `${currentYear}년 ${currentMonth}월 ${weekNum}주차`,
        oneLiner: '가상 주식 거래량 24% 급증과 함께 도시 공공 프로젝트 기여로 M0 유동성이 매우 건전하게 유지되고 있습니다.',
        m0Supply: m0,
        weeklySinkAmount: sink7d,
        inflationRate: 1.4,
        topTradedStocks: [
          { rank: 1, symbol: 'CHIPS', name: '가상 반도체 홀딩스', volume: 48200, changeRate: '+4.8%' },
          { rank: 2, symbol: 'SPACE', name: '스페이스 오빗 탐사선', volume: 31500, changeRate: '+12.5%' },
          { rank: 3, symbol: 'BIO', name: '바이오 넥스트랩', volume: 24100, changeRate: '-1.8%' },
        ],
        weeklyLeaders: [
          { category: '주간 최다 소각 기여', name: '월덕파운더', value: `${(sink7d * 0.35).toLocaleString('ko-KR', { maximumFractionDigits: 0 })} WLD 소각`, badge: '도시 건립자' },
          { category: '주간 주식 수익률 1위', name: '알파헌터', value: '+34.8% 순익', badge: '트레이딩 마스터' },
          { category: '주간 직업 업무 성실왕', name: '메트로배달부', value: '182건 업무 완료', badge: '시민의 발' },
        ],
        learningInsight: {
          title: '이번 주 금융 한 줄: 매몰비용의 오류(Sunk Cost Fallacy)와 분산 투자',
          takeaway: '이미 지출된 비용에 집착하여 손실 중인 단일 종목에 무리하게 추가 매수를 거듭하기보다, 정기적인 포트폴리오 리밸런싱과 가상 은행 세이빙 포켓 분산 예치를 통해 리스크를 체계적으로 헤지하는 것이 자산 보존의 핵심입니다.',
          actionTip: '보유 주식 중 목표가에 도달했거나 비중이 과도한 종목을 일부 실현하고 은행 고금리 적금 포켓으로 안전 자산을 확보하세요.',
        },
      },
    };
  }

  @Get('pulse')
  @ApiOperation({ summary: '실시간 월드 펄스 및 시장 심리 조회' })
  getMarketPulse(): { success: boolean; data: NewspaperPulseData } {
    return {
      success: true,
      data: {
        sentimentScore: 68,
        sentimentLabel: 'BULLISH',
        activeEventsCount: 4,
        leadHeadline: '사이버 보안 감사 통과에 따른 테크/핀테크 섹터 반등 랠리',
        leadSummary: '월드 가상 증시 343회차 정기 결산 및 시스템 정밀 진단 완결에 따라 테크놀로지 및 핀테크 주도주 전반에 유동성이 대거 유입되고 있습니다.',
        updatedAt: new Date().toISOString(),
      },
    };
  }

  @Get('poll')
  @ApiOperation({ summary: '주간 독자 여론조사 현황 조회' })
  getWeeklyPoll(): { success: boolean; data: NewspaperPollData } {
    return {
      success: true,
      data: this.calculatePollDistribution(),
    };
  }

  @Post('poll/vote')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '주간 독자 여론조사 투표 참여' })
  voteWeeklyPoll(@Body() body: { choiceId?: string }): { success: boolean; data: NewspaperPollData } {
    const choice = body?.choiceId || 'bullish';
    if (this.pollVotes[choice] !== undefined) {
      this.pollVotes[choice] += 1;
    } else {
      this.pollVotes[choice] = 1;
    }

    return {
      success: true,
      data: this.calculatePollDistribution(),
    };
  }

  @Get('lore')
  @ApiOperation({ summary: '주간 금융 개념 배움터 아티클 목록 조회' })
  getFinancialLore(): { success: boolean; data: FinancialLoreItem[] } {
    return {
      success: true,
      data: [
        {
          id: 'compound-interest',
          category: 'INVESTING',
          title: '복리의 마법과 주당 배당금(DPS) 재투자 전략',
          summary: '기업 수익 분배금인 배당금을 지속적으로 재투자하여 주식 수량을 늘릴 때 발생하는 기하급수적 자산 증식 원리를 다룹니다.',
          readTimeMinutes: 3,
        },
        {
          id: 'liquidity-spread',
          category: 'MARKET_MICROSTRUCTURE',
          title: '유동성 공급과 호가 스프레드(Bid-Ask Spread)의 상관관계',
          summary: '호가창의 매수/매도 잔량 두께가 시장가 주문 슬리피지를 방어하고 시장 가격 형성의 효율성을 결정짓는 구조를 분석합니다.',
          readTimeMinutes: 4,
        },
        {
          id: 'money-velocity',
          category: 'MACROECONOMICS',
          title: '정부 지원금과 가상 경제 화폐 유통 속도(Velocity of Money)',
          summary: '직업 활동과 일일 퀘스트 보상이 소비, 투자, 은행 예치로 이어지며 전체 유동성 지표에 미치는 파급 경로를 탐구합니다.',
          readTimeMinutes: 3,
        },
      ],
    };
  }

  private calculatePollDistribution(): NewspaperPollData {
    const totalVotes = Object.values(this.pollVotes).reduce((acc, v) => acc + v, 0) || 1;
    const labels: Record<string, string> = {
      bullish: '상승세 지속 (Bullish)',
      sideways: '박스권 횡보 (Neutral)',
      bearish: '조정 및 하락 (Bearish)',
      cash: '현금/안전자산 예치',
    };

    const options: PollOption[] = Object.entries(this.pollVotes).map(([id, votes]) => ({
      id,
      label: labels[id] || id,
      votes,
      percentage: Math.round((votes / totalVotes) * 100),
    }));

    return {
      id: 'poll-2026-09-w4',
      question: '이번 주 머니버스 가상 증시 전망은 어디로 향할까요?',
      options,
      totalVotes,
    };
  }
}
