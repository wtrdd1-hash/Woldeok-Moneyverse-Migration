import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { SupportController } from './support.controller';
import { SupportRepository } from './support.repository';
import { parseSupportKstRange } from './support-date-range';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const request = { session: { user_id: ACTOR } } as RequestWithSession;

describe('owner support last-message KST date window', () => {
  it('uses inclusive KST days with UTC-exclusive end, including leap day', () => {
    expect(parseSupportKstRange('2024-02-29', '2024-03-01')).toEqual({
      fromUtc: '2024-02-28T15:00:00.000Z', toUtcExclusive: '2024-03-01T15:00:00.000Z',
    });
  });
  it.each([['2024-02-30', '2024-03-01'], ['2026-10-31', '2026-10-30'],
    ['2025-01-01', '2026-12-31'], ['2026-01-01', undefined],
    [undefined, '2026-01-01'], [['2026-01-01'], '2026-01-02'],
  ])('rejects invalid, reversed, excessive and partial windows', (from, to) => {
    expect(() => parseSupportKstRange(from, to)).toThrow(BadRequestException);
  });
  it('binds owner, date range and existing filters to a bounded DB function', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repo = new SupportRepository({ query });
    const range = parseSupportKstRange('2026-10-30', '2026-10-31');
    await repo.myThreads(ACTOR, 'resolved', 'invoice', 'oldest', range);
    const [sql, params] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toContain('FROM public.support_my_threads($1,$2)');
    expect(sql).not.toMatch(/FROM\s+public\.support_threads\b/i);
    expect(sql).toMatch(/last_message_at >= \$\d+::timestamptz/);
    expect(sql).toMatch(/last_message_at < \$\d+::timestamptz/);
    expect(sql).toContain('ORDER BY last_message_at ASC,thread_id ASC LIMIT 50');
    expect(params).toEqual([ACTOR, 100, 'invoice', 'resolved', range.fromUtc, range.toUtcExclusive]);
  });
  it('rejects a partial window before any repository call', async () => {
    const myThreads = vi.fn(async () => []);
    const controller = new SupportController({ myThreads } as unknown as SupportRepository);
    await expect(controller.threads(request, undefined, undefined, undefined, '2026-10-30')).rejects.toBeInstanceOf(BadRequestException);
    expect(myThreads).not.toHaveBeenCalled();
    await controller.threads(request, 'resolved', undefined, undefined, '2026-10-30', '2026-10-31');
    expect(myThreads).toHaveBeenCalledWith(ACTOR, 'resolved', undefined, undefined, parseSupportKstRange('2026-10-30', '2026-10-31'));
  });
});
