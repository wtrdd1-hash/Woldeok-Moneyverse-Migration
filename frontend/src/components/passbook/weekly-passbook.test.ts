import { describe, expect, it } from 'vitest';
import { parseGameClock } from '@/lib/game-calendar';
import { weekColumns } from './weekly-passbook';

const clock = parseGameClock({
  dayIndex: 10415, weekIndex: 1487, dayOfWeek: 7, realSecondsPerDay: 600, gameDaysPerWeek: 7,
  dayStartedAt: '2026-11-25T22:50:00Z', dayEndsAt: '2026-11-25T23:00:00Z', weekStartedAt: '2026-11-25T21:50:00Z',
  dayKey: '2028-07-07', weekKey: '2028-07-01',
})!;
const tx = (occurredAt: string, netAmount: string, type = 'BANK_DEPOSIT') =>
  ({ transactionId: occurredAt, type, label: '', netAmount, direction: 'neutral' as const, occurredAt });

describe('weekColumns', () => {
  it('folds ledger lines into the seven game days and stamps the reward day', () => {
    const cols = weekColumns(clock, {
      transactions: [tx('2026-11-25T22:52:00Z', '100', 'MINT_TO_USER'), tx('2026-11-25T22:53:00Z', '-15'), tx('2026-11-25T21:55:00Z', '0'), tx('2026-11-24T10:00:00Z', '999')],
      hasMore: false, nextCursor: null, asOf: '2026-11-25T22:59:00.000Z',
    });
    expect(cols).toHaveLength(7);
    expect(cols[6]).toMatchObject({ dayKey: '2028-07-07', entries: 2, incoming: 100n, outgoing: 15n, rewarded: true });
    expect(cols[0]).toMatchObject({ dayKey: '2028-07-01', entries: 1, rewarded: false });
    expect(cols.reduce((n, c) => n + c.entries, 0)).toBe(3);
  });
});
