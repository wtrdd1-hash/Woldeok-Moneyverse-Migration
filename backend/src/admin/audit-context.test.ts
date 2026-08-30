import type { RequestWithSession } from '../auth/session.context';
import { describe, expect, it } from 'vitest';
import { requestContext } from '../core/request-context';
import { auditContext, featureFromPath } from './audit-context';

const PEPPER = 'a-test-pepper';

function request({
  path = '/api/v1/admin/audit-events',
  headers = {},
  session,
  adminRoles,
}: {
  path?: string;
  headers?: Record<string, string>;
  session?: { id: string; user_id: string; reauthenticated_at?: Date };
  adminRoles?: string[];
} = {}): RequestWithSession {
  const value = {
    method: 'GET',
    path,
    headers,
    socket: { remoteAddress: '203.0.113.7' },
    session,
    adminRoles,
  } as unknown as RequestWithSession;
  requestContext({ trustForwardedHeaders: false })(value, {} as never, () => {});
  return value;
}

describe('the feature an audit row is filed under', () => {
  it('reads it from the console path', () => {
    expect(featureFromPath('/api/v1/admin/audit-events')).toBe('audit_events');
    expect(featureFromPath('/api/v1/admin/users/abc/restriction')).toBe('users');
  });

  it('falls back rather than producing something the database would refuse', () => {
    // 063 checks the value against ^[a-z][a-z0-9_.:-]{2,63}$. A new route must
    // not be able to make its own audit write fail.
    expect(featureFromPath('/api/v1/admin/x')).toBe('console');
    expect(featureFromPath('/api/v1/status')).toBe('console');
  });
});

describe('the audit context', () => {
  it('records the request without recording the visitor', () => {
    const context = auditContext({
      request: request({
        headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0) Chrome/120.0.0.0 Safari/537.36' },
        session: { id: 'a4a3a2a1-0000-4000-8000-000000000000', user_id: 'u' },
      }),
      pepper: PEPPER,
      trustForwardedFor: false,
    });

    expect(context.userAgentFamily).toBe('Chrome on Windows');
    expect(context.userAgentHash).toMatch(/^[0-9a-f]{64}$/);
    expect(context.sessionHash).toMatch(/^[0-9a-f]{64}$/);
    // Neither the string nor the identifier survives, which is what 17.10
    // asks for and what makes the hash worth keeping.
    expect(JSON.stringify(context)).not.toContain('Mozilla');
    expect(JSON.stringify(context)).not.toContain('a4a3a2a1');
  });

  it('salts the hashes, so two deployments do not share a lookup table', () => {
    const shape = { session: { id: 's-1-2-3', user_id: 'u' } };
    const one = auditContext({ request: request(shape), pepper: 'one', trustForwardedFor: false });
    const two = auditContext({ request: request(shape), pepper: 'two', trustForwardedFor: false });
    expect(one.sessionHash).not.toBe(two.sessionHash);
  });

  it('omits an address it could not determine rather than sending inet a word', () => {
    const value = request();
    (value as unknown as { socket: { remoteAddress?: string } }).socket = {};
    const context = auditContext({ request: value, pepper: PEPPER, trustForwardedFor: false });
    expect(context).not.toHaveProperty('clientIp');
  });

  it('carries only keys migration 063 declares', () => {
    const declared = new Set([
      'traceId', 'sessionHash', 'authMethod', 'reauthenticatedAt', 'actorRoles',
      'clientIp', 'userAgentHash', 'userAgentFamily', 'httpMethod', 'httpPath',
      'feature', 'targetKind', 'targetLabel', 'targetCount', 'subjectUserId',
      'reason', 'ticket', 'memo', 'before', 'requested', 'verified', 'after',
      'policyVersionBefore', 'policyVersionAfter', 'effectiveAt',
      'featureStateBefore', 'featureStateAfter', 'transactionId',
      'originTransactionId', 'correctionTransactionId', 'accountId', 'amount',
      'currency', 'debitSummary', 'creditSummary', 'bulkTotal', 'bulkSucceeded',
      'bulkFailed', 'bulkSkipped', 'bulkOutcomes', 'outcome', 'responseStatus',
      'errorCode', 'errorClass', 'idempotencyKey', 'appliedFunction',
      'policyCode', 'receivedAt', 'completedAt', 'durationMs', 'occurredAtSeoul',
    ]);

    const context = auditContext({
      request: request({
        headers: { 'user-agent': 'curl/8.0' },
        session: { id: 's', user_id: 'u', reauthenticated_at: new Date() },
        adminRoles: ['superadmin'],
      }),
      pepper: PEPPER,
      trustForwardedFor: false,
      outcome: 'success',
      responseStatus: 200,
      durationMs: 12,
    });

    expect(Object.keys(context).filter((key) => !declared.has(key))).toStrictEqual([]);
  });
});
