import { Controller, Get, Header, Inject, Optional, Post, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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

  @Get('weekly-brief')
  @ApiOperation({ summary: 'Weekly economic report unavailable until every metric has verified provenance' })
  @ApiResponse({ status: 503, description: 'NEWSPAPER_WEEKLY_BRIEF_UNVERIFIED: weekly statistics and leaderboards lack certified evidence' })
  async getWeeklyBrief(): Promise<never> {
    // A partial balance probe cannot authenticate the synthetic inflation,
    // volume and member leaderboard values that the legacy report presented as live.
    throw new ServiceUnavailableException({
      statusCode: 503,
      code: 'NEWSPAPER_WEEKLY_BRIEF_UNVERIFIED',
      message: 'Weekly economic report is unavailable until its statistics and leaderboards are verified.',
    });
  }

  @Get('pulse')
  @ApiOperation({ summary: '진행 중인 가상시장 이벤트에 근거한 현재 시장 심리 조회' })
  async getMarketPulse(): Promise<{ success: boolean; data: NewspaperPulseData }> {
    if (!this.pool) throw new ServiceUnavailableException('market data unavailable');

    let events: Array<{
      headline: string;
      body: string;
      direction: 'up' | 'down';
      strength: number;
      starts_at: Date;
    }>;
    try {
      // Read only the secure market-event projection, never its restricted base table.
      const result = await this.pool.query<{
        headline: string; body: string; direction: 'up' | 'down';
        strength: number; starts_at: Date;
      }>(`SELECT headline, body, direction, strength, starts_at
           FROM public.stock_market_events_active()
           ORDER BY starts_at DESC LIMIT 100`);
      events = result.rows;
    } catch {
      // Unknown market state must not masquerade as a live bullish market.
      throw new ServiceUnavailableException('market data unavailable');
    }

    // This is an event-pressure index, NOT a traded-price indicator or a buy signal.
    const pressure = events.reduce((sum, event) =>
      sum + (event.direction === 'up' ? 1 : -1) * Math.min(3, Math.max(1, event.strength)) * 7, 0);
    const sentimentScore = Math.min(100, Math.max(0, 50 + pressure));
    const sentimentLabel: NewspaperPulseData['sentimentLabel'] = sentimentScore >= 85
      ? 'VERY_BULLISH' : sentimentScore >= 65 ? 'BULLISH'
      : sentimentScore <= 15 ? 'VERY_BEARISH' : sentimentScore <= 35 ? 'BEARISH' : 'NEUTRAL';
    const lead = events[0];
    return {
      success: true,
      data: {
        sentimentScore,
        sentimentLabel,
        activeEventsCount: events.length,
        leadHeadline: lead?.headline ?? '현재 진행 중인 시장 소식이 없습니다',
        leadSummary: lead?.body ?? '현재 영향 중인 가상시장 이벤트가 없어 중립으로 표시합니다.',
        updatedAt: lead?.starts_at instanceof Date
          ? lead.starts_at.toISOString() : new Date().toISOString(),
      },
    };
  }

  @Get('poll')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Reader poll unavailable until durable vote and tally provenance is verified' })
  @ApiResponse({ status: 503, description: 'NEWSPAPER_POLL_SOURCE_UNVERIFIED: no authoritative tally exists' })
  getWeeklyPoll(): never {
    // The previous totals were seeded literals, not recorded community votes.
    throw new ServiceUnavailableException({
      statusCode: 503,
      code: 'NEWSPAPER_POLL_SOURCE_UNVERIFIED',
      message: 'Reader poll results are unavailable until a verified tally source exists.',
    });
  }

  @Post('poll/vote')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Reader poll voting unavailable until durable, replay-safe receipts exist' })
  @ApiResponse({ status: 503, description: 'NEWSPAPER_POLL_VOTE_UNAVAILABLE: no durable actor-bound vote receipt' })
  voteWeeklyPoll(): never {
    // Do not accept a public vote into per-process memory or claim a successful receipt.
    throw new ServiceUnavailableException({
      statusCode: 503,
      code: 'NEWSPAPER_POLL_VOTE_UNAVAILABLE',
      message: 'Voting is unavailable until durable, actor-bound vote receipts are verified.',
    });
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

}
