import type { QueryResultRow } from 'pg';
import { ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { AccountSecurityController } from './account-security.controller';
import { AccountSecurityRepository } from './account-security.repository';

const actor = '11111111-1111-4111-8111-111111111111';
const current = '22222222-2222-4222-8222-222222222222';
const now = new Date('2026-10-26T00:00:00.000Z');
const row = {
  created_at: now, expires_at: now, last_seen_at: now,
  device_label: 'Windows device', current: true, administrator_session: false,
  token_hash: 'must never be exported', session_id: current, user_agent: 'private',
};

describe('member active-session export', () => {
  it('uses a bounded SECURITY DEFINER owner read, excluding session IDs and private device metadata', async () => {
    const query = vi.fn(async (_sql: string, _values: readonly unknown[]) => ({ rows: [row] }));
    const repo = new AccountSecurityRepository({ query } as unknown as Queryable);
    const result = await repo.activeSessionsForExport(actor, current);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('account_active_sessions($1::uuid, $2::uuid)'), [actor, current]);
    expect(query.mock.calls[0]?.[0]).toMatch(/LIMIT 101/i);
    expect(result).toEqual([{
      createdAt: now.toISOString(), expiresAt: now.toISOString(),
      lastSeenAt: now.toISOString(), deviceLabel: 'Windows device',
      current: true, administratorSession: false,
    }]);
    expect(JSON.stringify(result)).not.toMatch(/token_hash|session_id|user_agent|22222222/);
  });

  it('derives actor and current session from verified session and refuses incomplete export', async () => {
    const sessions = Array.from({ length: 101 }, () => ({
      createdAt: now.toISOString(), expiresAt: now.toISOString(), lastSeenAt: now.toISOString(),
      deviceLabel: 'Unknown device', current: false, administratorSession: false,
    }));
    const repo = { activeSessionsForExport: vi.fn().mockResolvedValue(sessions) };
    const controller = new AccountSecurityController(repo as unknown as AccountSecurityRepository);
    const request = { session: { user_id: actor, id: current } } as Parameters<typeof controller.exportSessions>[0];
    await expect(controller.exportSessions(request)).rejects.toBeInstanceOf(ConflictException);
    repo.activeSessionsForExport.mockResolvedValue(sessions.slice(0, 2));
    const result = await controller.exportSessions(request);
    expect(repo.activeSessionsForExport).toHaveBeenCalledWith(actor, current);
    expect(result).toMatchObject({ limit: 100, complete: true, sessions: sessions.slice(0, 2) });
    expect(result).not.toHaveProperty('sessionId');
  });

  it('does not allow an unguarded request to pick an arbitrary actor', async () => {
    const repo = { activeSessionsForExport: vi.fn() };
    const controller = new AccountSecurityController(repo as unknown as AccountSecurityRepository);
    await expect(controller.exportSessions({} as Parameters<typeof controller.exportSessions>[0])).rejects.toThrow(/guard order defect/);
    expect(repo.activeSessionsForExport).not.toHaveBeenCalled();
  });
});
