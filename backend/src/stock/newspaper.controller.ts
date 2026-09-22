import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

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

@ApiTags('newspaper')
@Controller('newspaper')
export class NewspaperController {
  private pollVotes: Record<string, number> = {
    bullish: 342,
    sideways: 215,
    bearish: 128,
    cash: 59,
  };

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
