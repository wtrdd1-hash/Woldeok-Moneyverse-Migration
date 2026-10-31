import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { BurnEventController } from './burn-event.controller';

const aggregate = { rows: [{ total_burned: '0', total_participants: '0' }] };
const recent = { rows: [] };

function controller(query: ReturnType<typeof vi.fn>) {
  return new BurnEventController({ query } as unknown as Queryable);
}

describe('burn draw statistics source integrity', () => {
  it('returns 503 rather than successful zeros when the aggregate query is denied', async () => {
    const query = vi.fn().mockRejectedValue(new Error('permission denied for burn_event_participations'));
    await expect(controller(query).getEventStats()).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('returns 503 rather than a fabricated empty recent list when the second query fails', async () => {
    const query = vi.fn().mockResolvedValueOnce(aggregate).mockRejectedValueOnce(new Error('database unavailable'));
    await expect(controller(query).getEventStats()).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(query).toHaveBeenCalledTimes(2);
  });

  it.each([
    { rows: [] },
    { rows: [{ total_burned: null, total_participants: '0' }] },
    { rows: [{ total_burned: '5.5', total_participants: '1' }] },
    { rows: [{ total_burned: '5', total_participants: '9007199254740993' }] },
  ])('rejects an invalid aggregate response rather than inventing a total: %j', async (result) => {
    const query = vi.fn().mockResolvedValueOnce(result).mockResolvedValueOnce(recent);
    await expect(controller(query).getEventStats()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('preserves a genuine zero aggregate and empty list when both database queries succeed', async () => {
    const query = vi.fn().mockResolvedValueOnce(aggregate).mockResolvedValueOnce(recent);
    await expect(controller(query).getEventStats()).resolves.toEqual({
      success: true,
      totalBurnedWld: '0',
      totalParticipants: 0,
      recentWinners: [],
    });
  });
});
