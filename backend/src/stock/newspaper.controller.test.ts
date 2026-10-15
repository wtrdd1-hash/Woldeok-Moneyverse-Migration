import { describe, expect, it } from 'vitest';
import { NewspaperController } from './newspaper.controller';

describe('NewspaperController', () => {
  it('uses real active market events for the pulse instead of canned market news', async () => {
    const query = async (sql: string) => {
      expect(sql).toContain('public.stock_market_events_active()');
      return { rows: [{
        headline: '실제 테스트 이벤트', body: '시장 이벤트 본문', direction: 'up',
        strength: 2, starts_at: new Date('2026-10-15T01:00:00Z'),
      }] };
    };
    const controller = new NewspaperController({ query } as never);
    const result = await controller.getMarketPulse();
    expect(result.success).toBe(true);
    expect(result.data.activeEventsCount).toBe(1);
    expect(result.data.leadHeadline).toBe('실제 테스트 이벤트');
    expect(result.data.leadSummary).toBe('시장 이벤트 본문');
    expect(result.data.sentimentScore).toBe(64);
    expect(result.data.updatedAt).toBe('2026-10-15T01:00:00.000Z');
  });

  it('never invents active events when none exist', async () => {
    const controller = new NewspaperController({ query: async () => ({ rows: [] }) } as never);
    const result = await controller.getMarketPulse();
    expect(result.data.activeEventsCount).toBe(0);
    expect(result.data.sentimentScore).toBe(50);
    expect(result.data.sentimentLabel).toBe('NEUTRAL');
    expect(result.data.leadHeadline).toContain('진행 중인 시장 소식이 없습니다');
  });

  it('fails closed if market data is unavailable rather than showing fake market sentiment', async () => {
    const controller = new NewspaperController();
    await expect(controller.getMarketPulse()).rejects.toMatchObject({ status: 503 });
  });

  it('returns weekly poll and correctly tallies vote distribution', () => {
    const controller = new NewspaperController();
    const initialPoll = controller.getWeeklyPoll();

    expect(initialPoll.success).toBe(true);
    expect(initialPoll.data.options.length).toBe(4);
    const initialVotes = initialPoll.data.totalVotes;

    const voteResult = controller.voteWeeklyPoll({ choiceId: 'bullish' });
    expect(voteResult.success).toBe(true);
    expect(voteResult.data.totalVotes).toBe(initialVotes + 1);
    const bullishOption = voteResult.data.options.find((o) => o.id === 'bullish');
    expect(bullishOption).toBeDefined();
    expect(bullishOption?.votes).toBeGreaterThan(0);
  });

  it('returns financial lore educational items', () => {
    const controller = new NewspaperController();
    const result = controller.getFinancialLore();

    expect(result.success).toBe(true);
    expect(result.data.length).toBe(3);
    expect(result.data[0].id).toBe('compound-interest');
    expect(result.data[1].id).toBe('liquidity-spread');
    expect(result.data[2].id).toBe('money-velocity');
  });
});
