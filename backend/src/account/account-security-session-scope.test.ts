import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { QueryResultRow } from 'pg';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';
import { AccountSecurityController } from './account-security.controller';
import { AccountSecurityRepository } from './account-security.repository';

const owner = '00000000-0000-4000-8000-000000000011';
const current = '00000000-0000-4000-8000-000000000012';
const other = '00000000-0000-4000-8000-000000000013';
const at = new Date('2026-10-30T01:00:00.000Z');
const row = (session_id: string) => ({ session_id, created_at: at,
  expires_at: new Date('2026-11-30T01:00:00.000Z'), reauthenticated_at: null,
  admin_opened_at: null, last_seen_at: at, device_label: 'Web browser' });
function request(): RequestWithSession {
  return { session: { id: current, user_id: owner } } as unknown as RequestWithSession;
}
function subject() {
  const query = vi.fn(async <T extends QueryResultRow>() => ({ rows: [row(current), row(other)] as unknown as T[] }));
  const repository = new AccountSecurityRepository({ query } as unknown as Queryable);
  return { controller: new AccountSecurityController(repository), query };
}

describe('owner-only active session scope', () => {
  it('filters other sessions only after the owner-bound SQL function returns the full list', async () => {
    const { controller, query } = subject();
    const filtered = await controller.sessions(request(), 'other');
    expect(filtered.sessions).toHaveLength(1);
    expect(filtered.sessions[0]).toMatchObject({ sessionId: other, current: false });
    expect(query).toHaveBeenCalledWith(expect.stringContaining('account_active_sessions($1::uuid, $2::uuid)'), [owner, current]);
    expect((await controller.sessions(request())).sessions).toHaveLength(2);
  });
  it('rejects invalid or duplicate scopes before querying owner SQL', async () => {
    const { controller, query } = subject();
    for (const scope of ['OTHER', '', 'current', ['other', 'all'], { scope: 'other' }]) {
      await expect(controller.sessions(request(), scope)).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(query).not.toHaveBeenCalled();
  });
  it('publishes optional scope in the mobile API contract', () => {
    const metadata = Reflect.getMetadata('swagger/apiParameters', AccountSecurityController.prototype.sessions) as
      readonly { name: string; required?: boolean; schema?: { enum?: string[] } }[];
    expect(metadata).toEqual(expect.arrayContaining([expect.objectContaining({
      name: 'scope', required: false, schema: expect.objectContaining({ enum: ['all', 'other'] }),
    })]));
  });
});
