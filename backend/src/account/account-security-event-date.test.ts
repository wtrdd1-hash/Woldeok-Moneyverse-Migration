import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';
import { AccountSecurityController } from './account-security.controller';
import { AccountSecurityRepository } from './account-security.repository';
import { parseSecurityEventDateRange } from './account-security-event-date';

const owner = '00000000-0000-4000-8000-000000000011';
const req = { session: { user_id: owner } } as unknown as RequestWithSession;
const rows = [
  { event_type: 'local_login_succeeded', created_at: new Date('2026-10-29T14:59:59.999Z') },
  { event_type: 'local_login_succeeded', created_at: new Date('2026-10-29T15:00:00.000Z') },
  { event_type: 'local_password_changed', created_at: new Date('2026-10-30T14:59:59.999Z') },
  { event_type: 'local_login_succeeded', created_at: new Date('2026-10-30T15:00:00.000Z') },
];
function repo() {
  const query = vi.fn(async () => ({ rows }));
  return { value: new AccountSecurityRepository({ query } as unknown as Queryable), query };
}

describe('owner security events inclusive KST date window', () => {
  it('accepts canonical Gregorian dates and treats KST day end as exclusive', () => {
    const range = parseSecurityEventDateRange('2026-10-30', '2026-10-30');
    expect(range).toEqual({
      from: '2026-10-30',
      to: '2026-10-30',
      startMs: Date.parse('2026-10-29T15:00:00.000Z'),
      endMs: Date.parse('2026-10-30T15:00:00.000Z'),
    });
    expect(parseSecurityEventDateRange('2024-02-29', '2024-02-29')).not.toBeNull();
  });
  it('rejects partial, malformed, reversed, or overlong ranges', () => {
    for (const [from, to] of [
      ['2026-10-30', undefined],
      [undefined, '2026-10-30'],
      ['2026-02-29', '2026-03-01'],
      ['2026-10-31', '2026-10-30'],
      ['2025-01-01', '2026-10-30'],
      [['2026-10-30'], '2026-10-30'],
      ['', '2026-10-30'],
    ]) {
      expect(parseSecurityEventDateRange(from, to)).toBeNull();
    }
  });
  it('filters after fetching only owner latest 20 and composes category without leaking metadata', async () => {
    const { value, query } = repo();
    const range = parseSecurityEventDateRange('2026-10-30', '2026-10-30')!;
    await expect(value.recentEvents(owner, 'all', range)).resolves.toEqual([
      { type: 'local_login_succeeded', createdAt: '2026-10-29T15:00:00.000Z' },
      { type: 'local_password_changed', createdAt: '2026-10-30T14:59:59.999Z' },
    ]);
    await expect(value.recentEvents(owner, 'settings', range)).resolves.toEqual([
      { type: 'local_password_changed', createdAt: '2026-10-30T14:59:59.999Z' },
    ]);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('account_recent_security_events($1::uuid, 20)'),
      [owner],
    );
  });
  it('serves a validated date range through the guarded HTTP controller', async () => {
    const { value, query } = repo();
    const controller = new AccountSecurityController(value);
    await expect(controller.events(req, 'settings', '2026-10-30', '2026-10-30')).resolves.toEqual({
      events: [{ type: 'local_password_changed', createdAt: '2026-10-30T14:59:59.999Z' }],
    });
    expect(query).toHaveBeenCalledWith(expect.any(String), [owner]);
  });
  it('returns HTTP 400 for invalid ranges before database access', async () => {
    const { value, query } = repo();
    const controller = new AccountSecurityController(value);
    await expect(controller.events(req, 'all', '2026-10-30', undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(
      controller.events(req, 'all', ['2026-10-30'], '2026-10-30'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(query).not.toHaveBeenCalled();
  });
});
