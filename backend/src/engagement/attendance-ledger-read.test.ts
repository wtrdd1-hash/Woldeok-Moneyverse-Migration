import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { DopamineRepository } from './dopamine.repository';

const ACTOR = '11111111-2222-4333-8444-555555555555';
const day = (offset: number) => {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const timestamp = Date.parse(`${today}T00:00:00Z`) + offset * 86400000;
  return new Date(timestamp).toISOString().slice(0, 10);
};

describe('ledger-backed attendance status', () => {
  it('reads only confirmed ledger postings and outbox evidence for the session actor', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ attended_date: day(0) }, { attended_date: day(-1) }] });
    const repo = new DopamineRepository({ query } as unknown as Queryable);
    const status = await repo.getAttendanceStatus(ACTOR);
    expect(status).toMatchObject({ checkedInToday: true, streakDays: 2, lastAttendedDate: day(0) });
    expect(query).toHaveBeenCalledTimes(1);
    const sql = query.mock.calls[0]?.[0] as string;
    expect(sql).toContain('public.ledger_transactions');
    expect(sql).toContain('public.ledger_postings');
    expect(sql).toContain('public.outbox_events');
    expect(sql).not.toContain('daily_attendance_logs');
    expect(query.mock.calls[0]?.[1]).toEqual([ACTOR]);
  });

  it('returns no verified attendance if no matching ledger receipt exists', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const status = await new DopamineRepository({ query } as unknown as Queryable).getAttendanceStatus(ACTOR);
    expect(status).toMatchObject({ checkedInToday: false, streakDays: 0, lastAttendedDate: null });
  });

  it('counts a yesterday-only streak but does not count gaps or future dates', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ attended_date: day(-1) }, { attended_date: day(-3) }] });
    const status = await new DopamineRepository({ query } as unknown as Queryable).getAttendanceStatus(ACTOR);
    expect(status).toMatchObject({ checkedInToday: false, streakDays: 1, lastAttendedDate: day(-1) });
  });
});
