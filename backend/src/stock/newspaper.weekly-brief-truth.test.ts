import { describe, expect, it, vi } from 'vitest';
import { NewspaperController } from './newspaper.controller';

const hold = { status: 503, response: { code: 'NEWSPAPER_WEEKLY_BRIEF_UNVERIFIED' } };

describe('P1: weekly brief must not report synthetic finance or member leaderboard data', () => {
  it('fails closed when the database is absent', async () => {
    await expect(new NewspaperController().getWeeklyBrief()).rejects.toMatchObject(hold);
  });

  it('fails closed when the database probe fails', async () => {
    const query = vi.fn().mockRejectedValue(new Error('database unavailable'));
    await expect(new NewspaperController({ query } as never).getWeeklyBrief()).rejects.toMatchObject(hold);
  });

  it('does not mark partial balance/sink evidence as a verified weekly report', async () => {
    const query = vi.fn().mockResolvedValueOnce({ rows: [{ total: '9007199254740993' }] })
      .mockResolvedValueOnce({ rows: [{ total_sink: '0' }] });
    await expect(new NewspaperController({ query } as never).getWeeklyBrief()).rejects.toMatchObject(hold);
  });
});
