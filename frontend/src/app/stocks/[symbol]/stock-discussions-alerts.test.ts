import { describe, expect, it } from 'vitest';
import type { StockDiscussionPost } from './stock-discussion-section';

// Helper logic mirrors the component calculation
export function calculateSentimentRatio(posts: readonly StockDiscussionPost[]) {
  const bullishCount = posts.filter((p) => p.stock?.stance === 'bullish').length;
  const bearishCount = posts.filter((p) => p.stock?.stance === 'bearish').length;
  const totalSentiment = bullishCount + bearishCount;
  const bullishRatio = totalSentiment > 0 ? Math.round((bullishCount / totalSentiment) * 100) : 50;
  return { bullishCount, bearishCount, totalSentiment, bullishRatio, bearishRatio: 100 - bullishRatio };
}

export function calculateRecommendedThreshold(
  conditionKind: 'price_at_or_above' | 'price_at_or_below' | 'day_change_at_or_above' | 'day_change_at_or_below',
  currentPrice: string
): string {
  const currentBig = BigInt(currentPrice || '100');
  if (conditionKind === 'price_at_or_above') {
    return ((currentBig * 110n) / 100n).toString();
  } else if (conditionKind === 'price_at_or_below') {
    return ((currentBig * 90n) / 100n).toString();
  } else if (conditionKind === 'day_change_at_or_above') {
    return '500';
  } else {
    return '-500';
  }
}

describe('Stock Discussions Sentiment and Alert Thresholds', () => {
  const samplePosts: StockDiscussionPost[] = [
    {
      postId: 'post-1',
      title: '강력 매수 관점입니다',
      authorName: '투자왕',
      createdAt: '2026-09-20T10:00:00Z',
      commentCount: 5,
      stock: {
        stockId: 'stock-1',
        symbol: 'WDX',
        name: 'Woldeok X',
        category: 'analysis',
        stance: 'bullish',
        positionDisclosure: 'holder',
      },
    },
    {
      postId: 'post-2',
      title: '단기 조정 예상, 매도',
      authorName: '신중파',
      createdAt: '2026-09-20T11:00:00Z',
      commentCount: 2,
      stock: {
        stockId: 'stock-1',
        symbol: 'WDX',
        name: 'Woldeok X',
        category: 'analysis',
        stance: 'bearish',
        positionDisclosure: 'no_position',
      },
    },
    {
      postId: 'post-3',
      title: '추가 상승 모멘텀 지속',
      authorName: '불스',
      createdAt: '2026-09-20T12:00:00Z',
      commentCount: 8,
      stock: {
        stockId: 'stock-1',
        symbol: 'WDX',
        name: 'Woldeok X',
        category: 'analysis',
        stance: 'bullish',
        positionDisclosure: 'holder',
      },
    },
    {
      postId: 'post-4',
      title: '관망 구간입니다',
      authorName: '중립러',
      createdAt: '2026-09-20T13:00:00Z',
      commentCount: 1,
      stock: {
        stockId: 'stock-1',
        symbol: 'WDX',
        name: 'Woldeok X',
        category: 'question',
        stance: 'neutral',
        positionDisclosure: 'no_position',
      },
    },
  ];

  it('calculates bullish/bearish ratio excluding neutral stance correctly', () => {
    const sentiment = calculateSentimentRatio(samplePosts);
    expect(sentiment.bullishCount).toBe(2);
    expect(sentiment.bearishCount).toBe(1);
    expect(sentiment.totalSentiment).toBe(3);
    // 2 / 3 = 66.666... -> 67%
    expect(sentiment.bullishRatio).toBe(67);
    expect(sentiment.bearishRatio).toBe(33);
  });

  it('returns balanced 50:50 ratio when no sentiment exists', () => {
    const sentiment = calculateSentimentRatio([]);
    expect(sentiment.totalSentiment).toBe(0);
    expect(sentiment.bullishRatio).toBe(50);
    expect(sentiment.bearishRatio).toBe(50);
  });

  it('calculates recommended threshold prices and bps reliably', () => {
    // Current price 1000 WLD
    expect(calculateRecommendedThreshold('price_at_or_above', '1000')).toBe('1100');
    expect(calculateRecommendedThreshold('price_at_or_below', '1000')).toBe('900');
    expect(calculateRecommendedThreshold('day_change_at_or_above', '1000')).toBe('500');
    expect(calculateRecommendedThreshold('day_change_at_or_below', '1000')).toBe('-500');

    // Current price 250 WLD
    expect(calculateRecommendedThreshold('price_at_or_above', '250')).toBe('275');
    expect(calculateRecommendedThreshold('price_at_or_below', '250')).toBe('225');
  });
});
