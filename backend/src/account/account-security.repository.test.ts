import { describe, expect, it } from 'vitest';
import type { Queryable, QueryResultLike } from '../core/db';
import { AccountSecurityRepository } from './account-security.repository';

function db(
  handler: (text: string, values: readonly unknown[]) => readonly Record<string, unknown>[],
): Queryable {
  return {
    async query(text: string, values: readonly unknown[] = []): Promise<QueryResultLike<any>> {
      return { rows: [...handler(text, values)] };
    },
  };
}

describe('AccountSecurityRepository', () => {
  it('lists only the intentionally exposed session metadata and marks the current session', async () => {
    const created = new Date('2026-09-13T00:00:00.000Z');
    const expires = new Date('2026-10-13T00:00:00.000Z');
    const repository = new AccountSecurityRepository(
      db(() => [
        {
          session_id: '00000000-0000-4000-8000-000000000001',
          created_at: created,
          expires_at: expires,
          reauthenticated_at: null,
          admin_opened_at: null,
        },
      ]),
    );

    const [session] = await repository.activeSessions(
      '00000000-0000-4000-8000-000000000099',
      '00000000-0000-4000-8000-000000000001',
    );
    expect(session).toEqual({
      sessionId: '00000000-0000-4000-8000-000000000001',
      createdAt: created.toISOString(),
      expiresAt: expires.toISOString(),
      reauthenticatedAt: null,
      current: true,
      administratorSession: false,
    });
    expect(session).not.toHaveProperty('token_hash');
    expect(session).not.toHaveProperty('csrf_hash');
  });

  it('protects the current session when revoking one other session', async () => {
    let observedValues: readonly unknown[] = [];
    const repository = new AccountSecurityRepository(
      db((_text, values) => {
        observedValues = values;
        return [];
      }),
    );
    const revoked = await repository.revokeOtherSession('user', 'current', 'current');
    expect(revoked).toBe(false);
    expect(observedValues).toEqual(['user', 'current', 'current']);
  });

  it('returns the number of other sessions revoked', async () => {
    const repository = new AccountSecurityRepository(
      db((text) => (text.includes('count(*)') ? [{ revoked_sessions: 3 }] : [])),
    );
    await expect(repository.revokeOtherSessions('user', 'current')).resolves.toBe(3);
  });
});
