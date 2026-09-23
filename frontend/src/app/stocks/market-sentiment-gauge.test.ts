import { describe, expect, it } from 'vitest';
import { computeMarketSentiment } from './market-sentiment-gauge';
import type { MarketEvent } from './market-news';

describe('computeMarketSentiment', () => {
  it('returns neutral sentiment (score 50) when events list is empty', () => {
    const sentiment = computeMarketSentiment([]);
    expect(sentiment.score).toBe(50);
    expect(sentiment.label).toContain('중립');
    expect(sentiment.totalPositive).toBe(0);
    expect(sentiment.totalNegative).toBe(0);
    expect(sentiment.stockSentiments).toHaveLength(0);
    expect(sentiment.factorScores.newsScore).toBe(50);
    expect(sentiment.factorScores.momentumScore).toBe(50);
    expect(sentiment.factorScores.volumeScore).toBe(50);
    expect(sentiment.factorScores.orderPressureScore).toBe(50);
  });

  it('computes bullish sentiment when positive events dominate', () => {
    const mockEvents: MarketEvent[] = [
      {
        id: '1',
        stock_id: 's1',
        symbol: 'WDT',
        name: '치무전자',
        direction: 'up',
        strength: 3,
        headline: '치무전자 실적 호조',
        body: '반도체 수출 급증',
        source: 'AI 뉴스룸',
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 3600000).toISOString(),
      },
    ];

    const sentiment = computeMarketSentiment(mockEvents);
    expect(sentiment.score).toBeGreaterThan(50);
    expect(sentiment.totalPositive).toBe(1);
    expect(sentiment.totalNegative).toBe(0);
    expect(sentiment.stockSentiments).toHaveLength(1);
    const firstStock = sentiment.stockSentiments[0];
    expect(firstStock?.symbol).toBe('WDT');
    expect(firstStock?.direction).toBe('up');
  });

  it('computes bearish sentiment when negative events dominate', () => {
    const mockEvents: MarketEvent[] = [
      {
        id: '2',
        stock_id: 's2',
        symbol: 'WDM',
        name: '월덱모빌리티',
        direction: 'down',
        strength: 4,
        headline: '물류비 급증',
        body: '운송 원가 부담',
        source: 'AI 뉴스룸',
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 3600000).toISOString(),
      },
    ];

    const sentiment = computeMarketSentiment(mockEvents);
    expect(sentiment.score).toBeLessThan(50);
    expect(sentiment.totalPositive).toBe(0);
    expect(sentiment.totalNegative).toBe(1);
    expect(sentiment.stockSentiments).toHaveLength(1);
    const firstStock = sentiment.stockSentiments[0];
    expect(firstStock?.symbol).toBe('WDM');
    expect(firstStock?.direction).toBe('down');
  });

  it('뉴스가 없을 때도 가격 모멘텀과 호가 압력을 반영한 4대 다요소 가중 점수를 산출해야 한다', () => {
    // 24h 가격 변동률 +10%, 거래량 지수 70, 매수 압력비 65
    const sentiment = computeMarketSentiment([], {
      priceChange24hPct: 10,
      volumeScore: 70,
      orderPressureBidRatio: 65,
    });

    // newsScore: 50 (40% = 20)
    // momentumScore: 50 + (10 * 3.33) = 83 (30% = 24.9)
    // volumeScore: 70 (20% = 14)
    // orderPressureScore: 65 (10% = 6.5)
    // 합계: 20 + 24.9 + 14 + 6.5 = 65.4 -> 65 (탐욕)
    expect(sentiment.factorScores.newsScore).toBe(50);
    expect(sentiment.factorScores.momentumScore).toBe(83);
    expect(sentiment.factorScores.volumeScore).toBe(70);
    expect(sentiment.factorScores.orderPressureScore).toBe(65);
    expect(sentiment.score).toBe(65);
    expect(sentiment.label).toContain('탐욕');
  });

  it('극단적인 공포 시장 상황에서 올바르게 최하위 점수를 도출해야 한다', () => {
    const bearEvents: MarketEvent[] = [
      {
        id: '3',
        stock_id: 's3',
        symbol: 'WDM',
        name: '월덱모빌리티',
        direction: 'down',
        strength: 5,
        headline: '대규모 적자 전환',
        body: '구조조정 돌입',
        source: 'AI 뉴스룸',
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 3600000).toISOString(),
      },
    ];

    const sentiment = computeMarketSentiment(bearEvents, {
      priceChange24hPct: -15, // momentumScore = 0
      volumeScore: 20,
      orderPressureBidRatio: 10,
    });

    // newsScore = 0 (40% = 0)
    // momentumScore = 0 (30% = 0)
    // volumeScore = 20 (20% = 4)
    // orderPressureScore = 10 (10% = 1)
    // 합계 = 5점 (극단적 공포)
    expect(sentiment.score).toBeLessThanOrEqual(25);
    expect(sentiment.label).toContain('극단적 공포');
  });
});
