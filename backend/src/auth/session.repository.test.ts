import { describe, expect, it } from 'vitest';
import type { Queryable } from '../core/db';
import { sha256 } from './crypto';
import { SessionRepository } from './session.repository';

interface RecordedQuery {
  readonly text: string;
  readonly values: readonly unknown[] | undefined;
}

function recordingPool(rowsFor: (text: string) => Record<string, unknown>[]): {
  pool: Queryable;
  queries: RecordedQuery[];
} {
  const queries: RecordedQuery[] = [];
  const pool: Queryable = {
    async query(text: string, values?: readonly unknown[]) {
      queries.push({ text, values });
      return { rows: rowsFor(text) as never[] };
    },
  };
  return { pool, queries };
}

describe('SessionRepository.create', () => {
  it('stores only hashes and returns the clear tokens once', async () => {
    const { pool, queries } = recordingPool(() => [
      { id: 'session-id', user_id: null, expires_at: new Date(0) },
    ]);
    const created = await new SessionRepository(pool).create();

    expect(created.token).not.toBe(created.csrfToken);
    const values = queries[0]?.values ?? [];
    expect(values).toContain(sha256(created.token));
    expect(values).toContain(sha256(created.csrfToken));
    expect(values).not.toContain(created.token);
    expect(values).not.toContain(created.csrfToken);
  });

  it('fails loudly when the insert returns no row', async () => {
    const { pool } = recordingPool(() => []);
    await expect(new SessionRepository(pool).create()).rejects.toThrow('session was not created');
  });
});

describe('SessionRepository.get', () => {
  it('rejects a token shorter than 32 characters without querying', async () => {
    const { pool, queries } = recordingPool(() => [{ id: 'x' }]);
    await expect(new SessionRepository(pool).get('short')).resolves.toBeNull();
    expect(queries).toHaveLength(0);
  });

  it('rejects a token longer than 512 characters without querying', async () => {
    const { pool, queries } = recordingPool(() => [{ id: 'x' }]);
    await expect(new SessionRepository(pool).get('x'.repeat(513))).resolves.toBeNull();
    expect(queries).toHaveLength(0);
  });

  it('rejects a non-string token without querying', async () => {
    const { pool, queries } = recordingPool(() => [{ id: 'x' }]);
    await expect(new SessionRepository(pool).get(42)).resolves.toBeNull();
    expect(queries).toHaveLength(0);
  });

  it('looks the session up by token hash, never by the token', async () => {
    const token = 'y'.repeat(64);
    const { pool, queries } = recordingPool(() => [{ id: 'session-id', user_id: null }]);
    await new SessionRepository(pool).get(token);
    expect(queries[0]?.values).toEqual([sha256(token)]);
  });

  it('excludes revoked and expired sessions in the query itself', async () => {
    const { pool, queries } = recordingPool(() => []);
    await new SessionRepository(pool).get('y'.repeat(64));
    expect(queries[0]?.text).toMatch(/revoked_at IS NULL/);
    expect(queries[0]?.text).toMatch(/expires_at>now\(\)/);
  });
});

describe('SessionRepository.verifyCsrf', () => {
  it('rejects a malformed CSRF token without querying', async () => {
    const { pool, queries } = recordingPool(() => [{ id: 'x' }]);
    await expect(new SessionRepository(pool).verifyCsrf('session-id', 'short')).resolves.toBe(
      false,
    );
    expect(queries).toHaveLength(0);
  });

  it('compares the hash of the presented token', async () => {
    const csrfToken = 'z'.repeat(64);
    const { pool, queries } = recordingPool(() => [{ id: 'session-id' }]);
    await expect(new SessionRepository(pool).verifyCsrf('session-id', csrfToken)).resolves.toBe(
      true,
    );
    expect(queries[0]?.values).toEqual(['session-id', sha256(csrfToken)]);
  });

  it('returns false when no row matches', async () => {
    const { pool } = recordingPool(() => []);
    await expect(
      new SessionRepository(pool).verifyCsrf('session-id', 'z'.repeat(64)),
    ).resolves.toBe(false);
  });
});

describe('SessionRepository.rotateCsrf', () => {
  it('stores the hash and returns the clear token', async () => {
    const { pool, queries } = recordingPool(() => [{ id: 'session-id' }]);
    const csrfToken = await new SessionRepository(pool).rotateCsrf('session-id');
    expect(queries[0]?.values).toEqual(['session-id', sha256(csrfToken)]);
  });

  it('fails when the session is not active', async () => {
    const { pool } = recordingPool(() => []);
    await expect(new SessionRepository(pool).rotateCsrf('session-id')).rejects.toThrow(
      'active session not found',
    );
  });
});

describe('SessionRepository.grantPreloginConsent', () => {
  const complete = {
    termsCompleted: true,
    privacyCompleted: true,
    ageConfirmed: true,
    termsVersion: '2026-01-01',
    privacyVersion: '2026-01-01',
  };

  it('requires every acknowledgement flag', async () => {
    const { pool } = recordingPool(() => [{ id: 'session-id' }]);
    const repository = new SessionRepository(pool);
    for (const missing of ['termsCompleted', 'privacyCompleted', 'ageConfirmed'] as const) {
      await expect(
        repository.grantPreloginConsent('session-id', { ...complete, [missing]: false }),
      ).rejects.toThrow(/acknowledgement and age confirmation/);
    }
  });

  it('requires both policy version strings', async () => {
    const { pool } = recordingPool(() => [{ id: 'session-id' }]);
    await expect(
      new SessionRepository(pool).grantPreloginConsent('session-id', {
        ...complete,
        termsVersion: undefined,
      }),
    ).rejects.toThrow(/policy version acknowledgement required/);
  });

  it('rejects a non-object acknowledgement', async () => {
    const { pool } = recordingPool(() => [{ id: 'session-id' }]);
    await expect(
      new SessionRepository(pool).grantPreloginConsent('session-id', null),
    ).rejects.toThrow();
  });

  // The grant only applies to a session that has not yet been bound to a
  // user: this is the pre-login gate, not a way to re-consent afterwards.
  it('constrains the update to a pre-login, unrevoked, unexpired session', async () => {
    const { pool, queries } = recordingPool(() => [{ id: 'session-id' }]);
    await new SessionRepository(pool).grantPreloginConsent('session-id', complete);
    expect(queries[0]?.text).toMatch(/s\.user_id IS NULL/);
    expect(queries[0]?.text).toMatch(/s\.revoked_at IS NULL/);
    expect(queries[0]?.text).toMatch(/s\.expires_at>now\(\)/);
  });
});

describe('SessionRepository.hasCurrentUserConsent', () => {
  it('delegates to the database function rather than reimplementing the rule', async () => {
    const { pool, queries } = recordingPool(() => [{ has_current_consent: true }]);
    await expect(new SessionRepository(pool).hasCurrentUserConsent('session-id')).resolves.toBe(
      true,
    );
    expect(queries[0]?.text).toContain('public.auth_session_has_current_consent');
  });

  it('is false when the function returns anything other than true', async () => {
    const { pool } = recordingPool(() => [{ has_current_consent: null }]);
    await expect(new SessionRepository(pool).hasCurrentUserConsent('session-id')).resolves.toBe(
      false,
    );
  });
});

describe('SessionRepository.hasRecentReauthentication', () => {
  it('defaults the window to 900 seconds', async () => {
    const { pool, queries } = recordingPool(() => [{ recent: true }]);
    await new SessionRepository(pool).hasRecentReauthentication('session-id');
    expect(queries[0]?.values).toEqual(['session-id', 900]);
  });

  it('is false when the function returns anything other than true', async () => {
    const { pool } = recordingPool(() => [{ recent: 'yes' }]);
    await expect(new SessionRepository(pool).hasRecentReauthentication('session-id')).resolves.toBe(
      false,
    );
  });
});

describe('SessionRepository.createChallenge', () => {
  const challenge = {
    provider: 'discord' as const,
    state: 's',
    stateHash: 'sh',
    codeVerifier: 'v',
    codeChallenge: 'c',
    nonce: 'n',
    nonceHash: 'nh',
    redirectUri: 'https://example.com/auth/discord/callback',
  };

  it('rejects an unknown challenge purpose', async () => {
    const { pool } = recordingPool(() => []);
    await expect(
      new SessionRepository(pool).createChallenge('session-id', challenge, 'elevate'),
    ).rejects.toThrow(TypeError);
  });

  it('accepts each known purpose', async () => {
    const { pool } = recordingPool(() => []);
    const repository = new SessionRepository(pool);
    for (const purpose of ['login', 'link', 'reauth']) {
      await expect(
        repository.createChallenge('session-id', challenge, purpose),
      ).resolves.toBeUndefined();
    }
  });

  // The verifier must be recoverable at callback time to complete PKCE, so it
  // is stored; the state and nonce are stored only as hashes.
  it('stores the state hash, not the state', async () => {
    const { pool, queries } = recordingPool(() => []);
    await new SessionRepository(pool).createChallenge('session-id', challenge, 'login');
    const values = queries[0]?.values ?? [];
    expect(values).toContain('sh');
    expect(values).not.toContain('s');
    expect(values).toContain('nh');
  });
});

describe('SessionRepository.consumeChallenge', () => {
  it('rejects a malformed state without querying', async () => {
    const { pool, queries } = recordingPool(() => [{ code_verifier: 'v' }]);
    await expect(
      new SessionRepository(pool).consumeChallenge({
        sessionId: 'session-id',
        provider: 'discord',
        state: 'short',
      }),
    ).resolves.toBeNull();
    expect(queries).toHaveLength(0);
  });

  // Marking consumed_at in the same UPDATE that reads the row is what makes a
  // challenge single-use: a replayed callback finds nothing to consume.
  it('consumes the challenge in the same statement that reads it', async () => {
    const { pool, queries } = recordingPool(() => [{ code_verifier: 'v' }]);
    await new SessionRepository(pool).consumeChallenge({
      sessionId: 'session-id',
      provider: 'discord',
      state: 'q'.repeat(64),
    });
    expect(queries[0]?.text).toMatch(/UPDATE oauth_challenges/);
    expect(queries[0]?.text).toMatch(/SET consumed_at=now\(\)/);
    expect(queries[0]?.text).toMatch(/consumed_at IS NULL/);
    expect(queries[0]?.values?.[0]).toBe(sha256('q'.repeat(64)));
  });
});

describe('SessionRepository.revoke', () => {
  it('never moves an existing revocation timestamp forward', async () => {
    const { pool, queries } = recordingPool(() => []);
    await new SessionRepository(pool).revoke('session-id');
    expect(queries[0]?.text).toMatch(/coalesce\(revoked_at, now\(\)\)/);
  });
});
