import { describe, expect, it } from 'vitest';
import { NewspaperController } from './newspaper.controller';

describe('NewspaperController', () => {
  it('returns market pulse data with sentiment and headline', () => {
    const controller = new NewspaperController();
    const result = controller.getMarketPulse();

    expect(result.success).toBe(true);
    expect(result.data.sentimentScore).toBeGreaterThanOrEqual(0);
    expect(result.data.sentimentScore).toBeLessThanOrEqual(100);
    expect(result.data.sentimentLabel).toBe('BULLISH');
    expect(result.data.leadHeadline).toContain('보안');
    expect(result.data.activeEventsCount).toBe(4);
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
