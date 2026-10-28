import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { parseWorkTaskMaxDuration, WorkInputError, WorkRepository } from './work.repository';

const ACTOR = '00000000-0000-4000-8000-000000000001';

describe('member work task maximum duration filter', () => {
  it('accepts omitted or strictly bounded positive integer seconds', () => {
    expect(parseWorkTaskMaxDuration(undefined)).toBeNull();
    expect(parseWorkTaskMaxDuration('300')).toBe(300);
    expect(parseWorkTaskMaxDuration('86400')).toBe(86400);
  });

  it.each([
    '',
    '0',
    '-1',
    '1.5',
    '01',
    '+5',
    'Infinity',
    '86401',
    '9007199254740993',
    '5 OR true',
    ['300', '600'],
  ])('rejects invalid duration %j', (value) => {
    expect(() => parseWorkTaskMaxDuration(value)).toThrow(WorkInputError);
  });

  it('filters through the actor-bound PostgreSQL function using parameters, not table grants', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repository = new WorkRepository({ query } as unknown as Queryable);
    expect(await repository.tasks(ACTOR, 900)).toEqual([]);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toContain('FROM public.work_task_board($1) AS task');
    expect(sql).toMatch(/task\.minimum_duration_seconds\s*<=\s*\$2::integer/);
    expect(params).toEqual([ACTOR, 900]);
  });
});
