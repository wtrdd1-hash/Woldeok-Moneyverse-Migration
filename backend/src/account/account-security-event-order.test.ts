import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import type { QueryResultRow } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';
import { AccountSecurityController } from './account-security.controller';
import { AccountSecurityRepository } from './account-security.repository';

const owner = '00000000-0000-4000-8000-000000000011';
const request = () => ({ session: { user_id: owner } }) as unknown as RequestWithSession;
const rows = [
  { event_type: 'local_login_succeeded', created_at: new Date('2026-10-31T10:00:00.000Z') },
  { event_type: 'local_password_changed', created_at: new Date('2026-10-31T09:00:00.000Z') },
  { event_type: 'local_login_succeeded', created_at: new Date('2026-10-31T08:00:00.000Z') },
];
function setup() {
  const query = vi.fn(async <T extends QueryResultRow>() => ({ rows: rows as unknown as T[] }));
  const repository = new AccountSecurityRepository({ query } as unknown as Queryable);
  return { query, repository, controller: new AccountSecurityController(repository) };
}
describe('owner security event chronology', () => {
  it('reverses only the latest owner 20 without querying the full audit history', async () => {
    const { query, controller } = setup();
    const newest = await controller.events(request(), 'all', 'recent');
    const oldest = await controller.events(request(), 'all', 'oldest');
    expect(newest.events.map((event) => event.createdAt)).toEqual([
      '2026-10-31T10:00:00.000Z', '2026-10-31T09:00:00.000Z', '2026-10-31T08:00:00.000Z',
    ]);
    expect(oldest.events.map((event) => event.createdAt)).toEqual([
      '2026-10-31T08:00:00.000Z', '2026-10-31T09:00:00.000Z', '2026-10-31T10:00:00.000Z',
    ]);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('account_recent_security_events($1::uuid, 20)'), [owner]);
  });
  it('combines login category and oldest-first within the same bounded owner snapshot', async () => {
    const { controller } = setup();
    const result = await controller.events(request(), 'login', 'oldest');
    expect(result.events.map((event) => event.createdAt)).toEqual([
      '2026-10-31T08:00:00.000Z', '2026-10-31T10:00:00.000Z',
    ]);
  });
  it('rejects duplicate, unexpected, empty and object sort values before querying', async () => {
    const { controller, query } = setup();
    for (const sort of ['newest', '', ['recent', 'oldest'], { value: 'oldest' }]) {
      await expect(controller.events(request(), 'all', sort)).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(query).not.toHaveBeenCalled();
  });
  it('exposes the sort enum to generated Android API clients', () => {
    const metadata = Reflect.getMetadata('swagger/apiParameters', AccountSecurityController.prototype.events) as
      readonly { name: string; required?: boolean; schema?: { enum?: string[] } }[] | undefined;
    expect(metadata).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'sort', required: false,
        schema: expect.objectContaining({ enum: ['recent', 'oldest'] }) }),
    ]));
  });
});
