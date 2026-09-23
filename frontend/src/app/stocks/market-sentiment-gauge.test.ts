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
    expect(sentiment.stockSentiments[0].symbol).toBe('WDT');
    expect(sentiment.stockSentiments[0].direction).toBe('up');
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
    expect(sentiment.stockSentiments[0].symbol).toBe('WDM');
    expect(sentiment.stockSentiments[0].direction).toBe('down');
  });
});
