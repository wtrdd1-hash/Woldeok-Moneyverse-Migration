import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import type { QueryResultRow } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';
import { AccountSecurityController } from './account-security.controller';
import { AccountSecurityRepository } from './account-security.repository';

const owner = '00000000-0000-4000-8000-000000000011';
const at = new Date('2026-10-30T03:00:00.000Z');
const rows = [
  { event_type: 'local_login_succeeded', created_at: at },
  { event_type: 'local_password_changed', created_at: at },
  { event_type: 'local_email_change_requested', created_at: at },
  { event_type: 'unknown_security_event', created_at: at },
];

function repository() {
  const query = vi.fn(async <T extends QueryResultRow>() => ({ rows: rows as unknown as T[] }));
  return { repository: new AccountSecurityRepository({ query } as unknown as Queryable), query };
}

function request(): RequestWithSession {
  return { session: { user_id: owner } } as unknown as RequestWithSession;
}

describe('owner-private security activity category filter', () => {
  it('filters only after owner-scoped latest 20 database events, without exposing audit metadata', async () => {
    const { repository: repo, query } = repository();
    await expect(repo.recentEvents(owner, 'login')).resolves.toEqual([
      { type: 'local_login_succeeded', createdAt: at.toISOString() },
    ]);
    await expect(repo.recentEvents(owner, 'settings')).resolves.toEqual([
      { type: 'local_password_changed', createdAt: at.toISOString() },
      { type: 'local_email_change_requested', createdAt: at.toISOString() },
    ]);
    await expect(repo.recentEvents(owner, 'all')).resolves.toHaveLength(4);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('account_recent_security_events($1::uuid, 20)'),
      [owner],
    );
  });

  it('rejects invalid and duplicated categories before querying PostgreSQL', async () => {
    const { repository: repo, query } = repository();
    const controller = new AccountSecurityController(repo);
    for (const category of ['unexpected', '', 'LOGIN', ['login', 'settings'], { key: 'login' }]) {
      await expect(controller.events(request(), category)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    }
    expect(query).not.toHaveBeenCalled();
  });

  it('uses the guarded session owner and preserves the default full recent view', async () => {
    const { repository: repo, query } = repository();
    const controller = new AccountSecurityController(repo);
    await expect(controller.events(request(), 'login')).resolves.toEqual({
      events: [{ type: 'local_login_succeeded', createdAt: at.toISOString() }],
    });
    await expect(controller.events(request())).resolves.toHaveProperty(
      'events',
      expect.arrayContaining([{ type: 'unknown_security_event', createdAt: at.toISOString() }]),
    );
    expect(query).toHaveBeenCalledWith(expect.any(String), [owner]);
  });
});
