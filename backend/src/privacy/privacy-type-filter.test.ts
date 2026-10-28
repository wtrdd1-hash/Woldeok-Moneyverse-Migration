import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { PrivacyController } from './privacy.controller';
import { PostgresPrivacyRequestRepository } from './privacy.repository';
import { PrivacyRequestService } from './privacy.service';

const USER = '11111111-1111-4111-8111-111111111111';
const RECORD = {
  request_id: '22222222-2222-4222-8222-222222222222',
  request_type: 'deletion',
  detail: null,
  status: 'received',
  created_at: '2026-10-28T00:00:00.000Z',
};

describe('owner-scoped recent privacy request type filter', () => {
  it('filters inside PostgreSQL after the latest 100 owner-scoped records and caps the result at 30', async () => {
    const query = vi.fn(async () => ({ rows: [RECORD] }));
    const repo = new PostgresPrivacyRequestRepository({ query } as never);
    const rows = await repo.listMyRequests({ actorUserId: USER, limit: 30, requestType: 'deletion' } as never);
    expect(rows).toEqual([RECORD]);
    expect(query).toHaveBeenCalledOnce();
    const [sql, params] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toMatch(/privacy_list_my_requests\(\$1,\s*\$2\)/);
    expect(sql).toMatch(/WHERE\s+[^\n]*request_type\s*=\s*\$3/i);
    expect(sql).toMatch(/LIMIT\s+\$4/i);
    expect(params).toEqual([USER, 100, 'deletion', 30]);
  });

  it('preserves the legacy 30-row query when no type is selected', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repo = new PostgresPrivacyRequestRepository({ query } as never);
    await repo.listMyRequests({ actorUserId: USER });
    const [sql, params] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).not.toMatch(/WHERE\s+[^\n]*request_type\s*=/i);
    expect(params).toEqual([USER, 30]);
  });

  it('rejects unsupported and coerced request types before hitting the database', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const service = new PrivacyRequestService(new PostgresPrivacyRequestRepository({ query } as never));
    for (const type of ['unknown', ['deletion'], 42, '', null]) {
      await expect(service.myRequests(USER, { requestType: type } as never)).rejects.toThrow(/supported privacy request type/);
    }
    expect(query).not.toHaveBeenCalled();
  });

  it('passes the session-bound actor and validates the query as HTTP 400', async () => {
    const query = vi.fn(async () => ({ rows: [RECORD] }));
    const service = new PrivacyRequestService(new PostgresPrivacyRequestRepository({ query } as never));
    const controller = new PrivacyController(service);
    const list = controller.list as unknown as (req: unknown, type: unknown) => Promise<{ requests: unknown[] }>;
    const request = { session: { user_id: USER } };
    const result = await list.call(controller, request, 'deletion');
    expect(result.requests).toHaveLength(1);
    expect(query.mock.calls[0]?.[1]).toEqual([USER, 100, 'deletion', 30]);
    await expect(list.call(controller, request, 'invalid')).rejects.toBeInstanceOf(BadRequestException);
  });
});
