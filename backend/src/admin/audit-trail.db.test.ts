import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from '../testing/database';

/**
 * Migrations 062-065, executed.
 *
 * The chain these exercise is only worth having if it can be checked, so the
 * tests that matter most are the ones that break a row on purpose: a row
 * edited in place, a typed column edited while the hashed envelope is left
 * alone, a link removed. Each has to be reported as its own kind of failure.
 *
 * Anything that appends to the chain runs as the schema owner inside a
 * transaction that is rolled back, because `audit_logs` refuses UPDATE and
 * DELETE for everyone including its owner -- the rows cannot be cleaned up
 * afterwards, so they must never be committed.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;
const UNKNOWN = '00000000-0000-4000-8000-000000000000';

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

interface EventRow {
  id: string;
  sequence: string;
  hash_version: number;
  previous_integrity_hash: string | null;
  integrity_hash: string;
  feature: string | null;
  client_ip: string | null;
  session_hash: string | null;
  outcome: string | null;
  response_status: number | null;
  trace_id: string | null;
}

interface VerificationRow {
  checked_count: string;
  verified_count: string;
  legacy_count: string;
  mismatch_count: string;
  link_break_count: string;
  column_drift_count: string;
  first_bad_sequence: string | null;
  status: string;
}

describe.skipIf(!DATABASE_URL)('the audit trail against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('what the application role may reach', () => {
    it('cannot rewrite the trail', async () => {
      const error = await rejectionOf(() =>
        pool.query("UPDATE public.audit_logs SET action = 'tampered'"),
      );
      expect(String((error as { message?: string }).message)).toMatch(/permission denied/i);
    });

    it('cannot read the verification, retention or disposition tables directly', async () => {
      for (const table of [
        'audit_chain_verifications',
        'audit_retention_policies',
        'audit_destruction_records',
      ]) {
        const error = await rejectionOf(() => pool.query(`SELECT * FROM public.${table}`));
        expect(
          String((error as { message?: string }).message),
          `${table} must be reachable only through a function`,
        ).toMatch(/permission denied/i);
      }
    });

    it('cannot compute a digest, which is what forging a chain would need', async () => {
      const error = await rejectionOf(() =>
        pool.query(
          `SELECT public.audit_event_digest(
             $1, 1::bigint, NULL, $1, 'x.y.z', NULL, NULL, '{}'::jsonb, now(), '{}'::jsonb
           )`,
          [UNKNOWN],
        ),
      );
      expect(String((error as { message?: string }).message)).toMatch(/permission denied/i);
    });

    it('refuses to search the trail for someone holding no role', async () => {
      const error = await rejectionOf(() =>
        pool.query(
          `SELECT * FROM public.admin_search_audit_events(
             $1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 10
           )`,
          [UNKNOWN],
        ),
      );
      expect(code(error)).toBe('42501');
    });

    it('answers a stranger with the role refusal, whatever they sent', async () => {
      // The role is checked before the filters, so a caller who may not read
      // the trail cannot use the error code to probe what the parameters are.
      const error = await rejectionOf(() =>
        pool.query(
          `SELECT * FROM public.admin_search_audit_events(
             $1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, $2, NULL, 10
           )`,
          [UNKNOWN, 'maybe'],
        ),
      );
      expect(code(error)).toBe('42501');
    });
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('the published retention policy', () => {
    let owner: Pool;

    beforeAll(() => {
      owner = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
    });

    afterAll(async () => {
      await owner.end();
    });

    it('seeds exactly the two periods the privacy document promises', async () => {
      // Read as the owner: `audit_active_retention_policy` is internal, and
      // the console reaches retention through the overview function instead.
      const { rows } = await owner.query<{ category: string; retention_days: number }>(
        `SELECT policy.category, policy.retention_days
         FROM public.audit_active_retention_policy($1) AS policy
         UNION ALL
         SELECT policy.category, policy.retention_days
         FROM public.audit_active_retention_policy($2) AS policy`,
        ['authentication', 'administration'],
      );
      expect(
        Object.fromEntries(rows.map((row) => [row.category, row.retention_days])),
      ).toStrictEqual({ authentication: 90, administration: 365 });
    });
  });

  /**
   * Appending, breaking and verifying. Every case below builds its own rows so
   * it never depends on what another test left behind, and the transaction is
   * rolled back so it leaves nothing behind either.
   */
  describe.skipIf(!MIGRATOR_DATABASE_URL)('the chain itself', () => {
    let migrator: Pool;

    beforeAll(() => {
      migrator = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
    });

    afterAll(async () => {
      await migrator.end();
    });

    const rolledBack = async (body: (client: PoolClient) => Promise<void>): Promise<void> => {
      const client = await migrator.connect();
      try {
        await client.query('BEGIN');
        await body(client);
      } finally {
        await client.query('ROLLBACK');
        client.release();
      }
    };

    /** An active account, optionally holding a role. */
    const member = async (client: PoolClient, role?: string): Promise<string> => {
      const id = randomUUID();
      await client.query('INSERT INTO public.users (id) VALUES ($1)', [id]);
      if (role) {
        await client.query('INSERT INTO public.user_roles (user_id, role) VALUES ($1, $2)', [
          id,
          role,
        ]);
      }
      return id;
    };

    const append = async (
      client: PoolClient,
      actor: string,
      action: string,
      metadata: unknown = {},
      context: unknown = {},
    ): Promise<EventRow> => {
      const { rows } = await client.query<{ audit_id: string }>(
        'SELECT public.admin_append_audit_event($1,$2,NULL,NULL,$3::jsonb,$4::jsonb) AS audit_id',
        [actor, action, metadata, context],
      );
      const { rows: stored } = await client.query<EventRow>(
        `SELECT id, sequence::text AS sequence, hash_version, previous_integrity_hash,
                integrity_hash, feature, client_ip::text AS client_ip, session_hash,
                outcome, response_status, trace_id
         FROM public.audit_logs WHERE id = $1`,
        [rows[0]?.audit_id],
      );
      const row = stored[0];
      if (!row) throw new Error('the appended event was not stored');
      return row;
    };

    const verify = async (
      client: PoolClient,
      actor: string,
      from: string,
      to: string,
    ): Promise<VerificationRow> => {
      const { rows } = await client.query<VerificationRow>(
        `SELECT result.checked_count::text AS checked_count,
                result.verified_count::text AS verified_count,
                result.legacy_count::text AS legacy_count,
                result.mismatch_count::text AS mismatch_count,
                result.link_break_count::text AS link_break_count,
                result.column_drift_count::text AS column_drift_count,
                result.first_bad_sequence::text AS first_bad_sequence,
                result.status
         FROM public.admin_verify_audit_chain($1, $2::bigint, $3::bigint) AS result`,
        [actor, from, to],
      );
      const row = rows[0];
      if (!row) throw new Error('verification returned no row');
      return row;
    };

    it('numbers rows consecutively and links each to the one before it', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client, 'approver');
        const first = await append(client, actor, 'admin.test.first');
        const second = await append(client, actor, 'admin.test.second');

        expect(BigInt(second.sequence) - BigInt(first.sequence)).toBe(1n);
        expect(second.previous_integrity_hash).toBe(first.integrity_hash);
        expect(second.hash_version).toBe(2);
      });
    });

    it('recomputes to the same digest it stored', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client, 'approver');
        const first = await append(client, actor, 'admin.test.first');
        const last = await append(client, actor, 'admin.test.second');

        const result = await verify(client, actor, first.sequence, last.sequence);
        expect(result.status).toBe('passed');
        expect(result.mismatch_count).toBe('0');
        expect(result.column_drift_count).toBe('0');
        expect(result.link_break_count).toBe('0');
      });
    });

    it('refuses an UPDATE and a DELETE, for its owner too', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client, 'approver');
        const event = await append(client, actor, 'admin.test.first');

        const updated = await rejectionOf(() =>
          client.query("UPDATE public.audit_logs SET action = 'tampered' WHERE id = $1", [
            event.id,
          ]),
        );
        expect(code(updated)).toBe('55000');
      });

      await rolledBack(async (client) => {
        const actor = await member(client, 'approver');
        const event = await append(client, actor, 'admin.test.first');

        const deleted = await rejectionOf(() =>
          client.query('DELETE FROM public.audit_logs WHERE id = $1', [event.id]),
        );
        expect(code(deleted)).toBe('55000');
      });
    });

    it('reports an edited body as a mismatch', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client, 'approver');
        const event = await append(client, actor, 'admin.test.first', { before: 1 });

        // The only way to write to this table. A migration that genuinely has
        // to touch history does exactly this, in the open.
        await client.query('ALTER TABLE public.audit_logs DISABLE TRIGGER audit_logs_immutable');
        await client.query(
          `UPDATE public.audit_logs SET metadata = '{"before": 2}'::jsonb WHERE id = $1`,
          [event.id],
        );
        await client.query('ALTER TABLE public.audit_logs ENABLE TRIGGER audit_logs_immutable');

        const result = await verify(client, actor, event.sequence, event.sequence);
        expect(result.status).toBe('failed');
        expect(result.mismatch_count).toBe('1');
        expect(result.first_bad_sequence).toBe(event.sequence);
      });
    });

    it('reports a typed column edited behind the hash as drift, not as a mismatch', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client, 'approver');
        const event = await append(
          client,
          actor,
          'admin.test.first',
          {},
          { feature: 'console', outcome: 'success' },
        );

        await client.query('ALTER TABLE public.audit_logs DISABLE TRIGGER audit_logs_immutable');
        await client.query("UPDATE public.audit_logs SET feature = 'wallet' WHERE id = $1", [
          event.id,
        ]);
        await client.query('ALTER TABLE public.audit_logs ENABLE TRIGGER audit_logs_immutable');

        const result = await verify(client, actor, event.sequence, event.sequence);
        // The digest covers `context`, which was not touched, so the content
        // still hashes correctly. Only the column check catches this.
        expect(result.mismatch_count).toBe('0');
        expect(result.column_drift_count).toBe('1');
        expect(result.status).toBe('failed');
      });
    });

    it('refuses a row that claims to be checked by the retired formula', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client, 'approver');
        const event = await append(client, actor, 'admin.test.first');

        // Without the CHECK this is how the chain gets defeated: edit the row
        // behind the disabled trigger, set hash_version to 1, and the verifier
        // takes the legacy arm, where a failed reproduction counts as
        // `legacy` -- which the status does not test. A CHECK survives the
        // trigger being off; that is the whole reason it is a CHECK.
        await client.query('ALTER TABLE public.audit_logs DISABLE TRIGGER audit_logs_immutable');
        const error = await rejectionOf(() =>
          client.query('UPDATE public.audit_logs SET hash_version = 1 WHERE id = $1', [event.id]),
        );
        expect(code(error)).toBe('23514');
      });
    });

    it('reports an address planted on a row that was signed without one', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client, 'approver');
        const event = await append(client, actor, 'admin.test.first', {}, { feature: 'console' });

        await client.query('ALTER TABLE public.audit_logs DISABLE TRIGGER audit_logs_immutable');
        await client.query(
          "UPDATE public.audit_logs SET client_ip = '203.0.113.9'::inet WHERE id = $1",
          [event.id],
        );
        await client.query('ALTER TABLE public.audit_logs ENABLE TRIGGER audit_logs_immutable');

        // This is the direction that ADDS an attribution -- it makes the trail
        // say an administrator acted from an address they never used. The
        // comparison returns NULL here rather than false, and `IF NOT NULL` is
        // not true, so without a coalesce the drift went unreported.
        const result = await verify(client, actor, event.sequence, event.sequence);
        expect(result.column_drift_count).toBe('1');
        expect(result.status).toBe('failed');
      });
    });

    it('clamps a generous window instead of refusing it or inventing a break', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client, 'approver');
        const event = await append(client, actor, 'admin.test.first');
        const beyond = (BigInt(event.sequence) + 500000n).toString();

        // A caller who does not know where the chain ends asks for everything
        // above their row. Measuring the span against the raw bound would
        // refuse a window that covers one row.
        const result = await verify(client, actor, event.sequence, beyond);
        expect(result.status).toBe('passed');
        expect(result.link_break_count).toBe('0');
        expect(result.checked_count).toBe('1');
      });
    });

    it('keeps its own verification history append-only', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client, 'approver');
        const event = await append(client, actor, 'admin.test.first');
        await verify(client, actor, event.sequence, event.sequence);

        const error = await rejectionOf(() =>
          client.query("UPDATE public.audit_chain_verifications SET status = 'passed'"),
        );
        expect(code(error)).toBe('55000');
      });
    });
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('what may be written into an event', () => {
    let migrator: Pool;

    beforeAll(() => {
      migrator = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
    });

    afterAll(async () => {
      await migrator.end();
    });

    const refusal = async (
      metadata: unknown,
      context: unknown,
    ): Promise<{ code?: string; message?: string }> => {
      const client = await migrator.connect();
      try {
        await client.query('BEGIN');
        const actor = randomUUID();
        await client.query('INSERT INTO public.users (id) VALUES ($1)', [actor]);
        const error = await rejectionOf(() =>
          client.query(
            'SELECT public.admin_append_audit_event($1,$2,NULL,NULL,$3::jsonb,$4::jsonb)',
            [actor, 'admin.test.first', metadata, context],
          ),
        );
        return {
          code: code(error),
          message: String((error as { message?: string })?.message ?? ''),
        };
      } finally {
        await client.query('ROLLBACK');
        client.release();
      }
    };

    it('refuses a context field nobody declared', async () => {
      const error = await refusal({}, { whateverSeemedUseful: 'x' });
      expect(error.code).toBe('22023');
      expect(error.message).toMatch(/unknown audit context field/);
    });

    it('refuses a secret in the metadata, however deeply it is buried', async () => {
      for (const metadata of [
        { accessToken: 'x' },
        { request: { headers: { cookie: 'x' } } },
        { steps: [{ ok: true }, { databaseUrl: 'postgres://x' }] },
      ]) {
        const error = await refusal(metadata, {});
        expect(error.code, JSON.stringify(metadata)).toBe('22023');
        expect(error.message).toMatch(/forbidden field/);
      }
    });

    it('refuses a session hash that is not one', async () => {
      const error = await refusal({}, { sessionHash: 'not-a-digest' });
      expect(error.code).toBe('22023');
      expect(error.message).toMatch(/sessionHash/);
    });

    it('refuses an address that is not one', async () => {
      const error = await refusal({}, { clientIp: 'unknown' });
      expect(error.code).toBe('22023');
      expect(error.message).toMatch(/clientIp/);
    });

    it('refuses an outcome outside the three it records', async () => {
      const error = await refusal({}, { outcome: 'probably' });
      expect(error.code).toBe('22023');
    });

    it('puts the declared fields into the columns the console searches', async () => {
      const client = await migrator.connect();
      try {
        await client.query('BEGIN');
        const actor = randomUUID();
        await client.query('INSERT INTO public.users (id) VALUES ($1)', [actor]);
        const trace = randomUUID();
        const { rows } = await client.query<{ audit_id: string }>(
          'SELECT public.admin_append_audit_event($1,$2,NULL,NULL,$3::jsonb,$4::jsonb) AS audit_id',
          [
            actor,
            'admin.test.first',
            {},
            {
              traceId: trace,
              feature: 'audit',
              clientIp: '203.0.113.7',
              outcome: 'success',
              responseStatus: 200,
            },
          ],
        );
        const { rows: stored } = await client.query<EventRow>(
          `SELECT host(client_ip) AS client_ip, feature, outcome, response_status, trace_id
           FROM public.audit_logs WHERE id = $1`,
          [rows[0]?.audit_id],
        );
        expect(stored[0]).toMatchObject({
          client_ip: '203.0.113.7',
          feature: 'audit',
          outcome: 'success',
          response_status: 200,
          trace_id: trace,
        });
      } finally {
        await client.query('ROLLBACK');
        client.release();
      }
    });

    it('accepts every metadata key the writers already in the schema send', async () => {
      // The regression that made this necessary: the forbidden pattern is
      // matched unanchored, so a bare `credential` alternative matched
      // migration 058's own `replacedConfirmedCredential` and refused the
      // audit write inside `admin_totp_begin_enrolment` -- which rolled the
      // enrolment back with it, locking every administrator out of the second
      // factor. Nothing in the suite covered a successful enrolment, so CI
      // stayed green. A new alternative belongs here before it belongs in 063.
      const shipped = [
        'action', 'announcementId', 'approvalRequestId', 'decision', 'discord',
        'displacedUserId', 'effectiveAt', 'entries', 'failedAttempts', 'featureKey',
        'guildId', 'imageHost', 'keyId', 'lockedUntil', 'nextState', 'operation',
        'outcome', 'photoId', 'previousState', 'previousVersion', 'published',
        'reason', 'replacedConfirmedCredential', 'requesterId', 'requestType',
        'requiresTwoPersonApproval', 'restoredVersion', 'revokedSessions', 'role',
        'rolledBackVersion', 'rotatedFrom', 'step', 'surface', 'version',
      ];

      const { rows } = await migrator.query<{ key: string | null }>(
        'SELECT public.audit_first_sensitive_key($1::jsonb) AS key',
        [Object.fromEntries(shipped.map((key) => [key, 'value']))],
      );
      expect(rows[0]?.key, 'a key an existing writer already sends is refused').toBeNull();
    });

    it('canonicalises the address it stores, so an untouched row never reads as drifted', async () => {
      const client = await migrator.connect();
      try {
        await client.query('BEGIN');
        const actor = randomUUID();
        await client.query('INSERT INTO public.users (id) VALUES ($1)', [actor]);
        await client.query('INSERT INTO public.user_roles (user_id, role) VALUES ($1, $2)', [
          actor,
          'approver',
        ]);
        // A spelling `inet` accepts and does not reproduce. Storing it as
        // typed would leave the column and the signed envelope disagreeing for
        // the life of the row.
        const { rows } = await client.query<{ audit_id: string }>(
          'SELECT public.admin_append_audit_event($1,$2,NULL,NULL,$3::jsonb,$4::jsonb) AS audit_id',
          [actor, 'admin.test.canonical', {}, { clientIp: '::ffff:203.0.113.7' }],
        );
        const { rows: stored } = await client.query<{ sequence: string; matches: boolean }>(
          `SELECT audit_row.sequence::text AS sequence,
                  public.audit_columns_match_context(audit_row) AS matches
           FROM public.audit_logs AS audit_row WHERE audit_row.id = $1`,
          [rows[0]?.audit_id],
        );
        expect(stored[0]?.matches).toBe(true);
      } finally {
        await client.query('ROLLBACK');
        client.release();
      }
    });

    it('lets a member with no role record that the console refused them', async () => {
      const client = await migrator.connect();
      try {
        await client.query('BEGIN');
        const actor = randomUUID();
        await client.query('INSERT INTO public.users (id) VALUES ($1)', [actor]);

        // The point of the function: `admin_record_audit_event` would reject
        // this caller for holding no role, which is exactly the caller whose
        // refusal has to be recorded.
        const { rows } = await client.query<{ audit_id: string }>(
          'SELECT public.admin_record_console_access($1,$2,NULL,NULL,$3::jsonb,$4::jsonb) AS audit_id',
          [actor, 'admin.wallet.denied', {}, { outcome: 'failure', responseStatus: 403 }],
        );
        expect(rows[0]?.audit_id).toBeTruthy();

        const namespaced = await rejectionOf(() =>
          client.query(
            'SELECT public.admin_record_console_access($1,$2,NULL,NULL,$3::jsonb,$4::jsonb)',
            [actor, 'wallet.denied', {}, {}],
          ),
        );
        expect(code(namespaced)).toBe('22023');
      } finally {
        await client.query('ROLLBACK');
        client.release();
      }
    });
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('reading and disposing', () => {
    let migrator: Pool;

    beforeAll(() => {
      migrator = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
    });

    afterAll(async () => {
      await migrator.end();
    });

    it('masks the address and the session hash on the way out', async () => {
      const client = await migrator.connect();
      try {
        await client.query('BEGIN');
        const actor = randomUUID();
        await client.query('INSERT INTO public.users (id) VALUES ($1)', [actor]);
        await client.query('INSERT INTO public.user_roles (user_id, role) VALUES ($1, $2)', [
          actor,
          'approver',
        ]);
        await client.query(
          'SELECT public.admin_append_audit_event($1,$2,NULL,NULL,$3::jsonb,$4::jsonb)',
          [
            actor,
            'admin.test.masked',
            {},
            { clientIp: '203.0.113.7', sessionHash: 'a'.repeat(64) },
          ],
        );

        const { rows } = await client.query<{
          client_ip: string;
          session_hash: string;
          context: unknown;
        }>(
          `SELECT event.client_ip, event.session_hash, event.context
           FROM public.admin_search_audit_events(
             $1, NULL, NULL, $1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1
           ) AS event`,
          [actor],
        );
        expect(rows[0]?.client_ip).toBe('203.0.113.0/24');
        expect(rows[0]?.session_hash).toBe('a'.repeat(12));
        // The column and the envelope carry the same value, so masking one and
        // returning the other whole hands the reader exactly what was hidden.
        const context = rows[0]?.context as Record<string, unknown>;
        expect(context.sessionHash).toBe('a'.repeat(12));
        expect(context.clientIp).toBe('203.0.113.0/24');
      } finally {
        await client.query('ROLLBACK');
        client.release();
      }
    });

    it('records the unmasking as its own event, and refuses a thin reason', async () => {
      const client = await migrator.connect();
      try {
        await client.query('BEGIN');
        const actor = randomUUID();
        await client.query('INSERT INTO public.users (id) VALUES ($1)', [actor]);
        await client.query('INSERT INTO public.user_roles (user_id, role) VALUES ($1, $2)', [
          actor,
          'superadmin',
        ]);
        const { rows } = await client.query<{ audit_id: string }>(
          'SELECT public.admin_append_audit_event($1,$2,NULL,NULL,$3::jsonb,$4::jsonb) AS audit_id',
          [actor, 'admin.test.masked', {}, { clientIp: '203.0.113.7' }],
        );
        const target = rows[0]?.audit_id;

        // A savepoint, because a failed statement aborts the whole
        // transaction and everything asserted below it would then answer
        // 25P02 instead of what it was asked.
        await client.query('SAVEPOINT before_thin_reason');
        const thin = await rejectionOf(() =>
          client.query('SELECT * FROM public.admin_reveal_audit_event($1,$2,$3)', [
            actor,
            target,
            'too short',
          ]),
        );
        expect(code(thin)).toBe('22023');
        await client.query('ROLLBACK TO SAVEPOINT before_thin_reason');

        const { rows: revealed } = await client.query<{ client_ip: string }>(
          'SELECT reveal.client_ip FROM public.admin_reveal_audit_event($1,$2,$3) AS reveal',
          [actor, target, 'investigating a reported anomaly on the ledger'],
        );
        expect(revealed[0]?.client_ip).toBe('203.0.113.7');

        const { rows: trail } = await client.query<{ action: string; target_id: string }>(
          `SELECT action, target_id::text AS target_id FROM public.audit_logs
           WHERE actor_user_id = $1 AND action = 'admin.audit.unmasked'`,
          [actor],
        );
        expect(trail).toHaveLength(1);
        expect(trail[0]?.target_id).toBe(target);
      } finally {
        await client.query('ROLLBACK');
        client.release();
      }
    });

    it('files a disposition without deleting anything, and will not let it be edited', async () => {
      const client = await migrator.connect();
      try {
        await client.query('BEGIN');
        const actor = randomUUID();
        await client.query('INSERT INTO public.users (id) VALUES ($1)', [actor]);
        await client.query('INSERT INTO public.user_roles (user_id, role) VALUES ($1, $2)', [
          actor,
          'superadmin',
        ]);
        const { rows } = await client.query<{ audit_id: string }>(
          'SELECT public.admin_append_audit_event($1,$2,NULL,NULL,$3::jsonb,$4::jsonb) AS audit_id',
          [actor, 'admin.test.disposable', {}, {}],
        );
        const { rows: stored } = await client.query<{ sequence: string }>(
          'SELECT sequence::text AS sequence FROM public.audit_logs WHERE id = $1',
          [rows[0]?.audit_id],
        );
        const sequence = stored[0]?.sequence as string;

        const { rows: filed } = await client.query<{ row_count: string; method: string }>(
          `SELECT record.row_count::text AS row_count, record.method
           FROM public.admin_record_audit_destruction(
             $1,$2,'administration',$3::bigint,$4::bigint,'archived','',$5
           ) AS record`,
          [randomUUID(), actor, sequence, sequence, 'retention period reached, archived to cold storage'],
        );
        expect(filed[0]?.row_count).toBe('1');
        expect(filed[0]?.method).toBe('archived');

        // The subject of the record is still there. 14.9 asks for a record of
        // the disposal, not for the evidence to disappear.
        const { rows: survivors } = await client.query<{ count: string }>(
          'SELECT count(*)::text AS count FROM public.audit_logs WHERE id = $1',
          [rows[0]?.audit_id],
        );
        expect(survivors[0]?.count).toBe('1');

        const error = await rejectionOf(() =>
          client.query("UPDATE public.audit_destruction_records SET method = 'destroyed'"),
        );
        expect(code(error)).toBe('55000');
      } finally {
        await client.query('ROLLBACK');
        client.release();
      }
    });

    it('files each action under the period the privacy document promises for it', async () => {
      // The two 'administration' cases at the end are the ones an unanchored
      // pattern got wrong: `login_policy` is an administrator changing policy,
      // not a sign-in, and the trail writes `.failed` for every ordinary
      // administrative error. Both carry the one-year promise, and filing them
      // at ninety days would have a superadmin sign an immutable destruction
      // record over records that were not due.
      const expected: ReadonlyArray<readonly [string, string]> = [
        ['admin.wallet.denied', 'authentication'],
        ['admin.login.blocked', 'authentication'],
        ['admin.second_factor.failed', 'authentication'],
        ['admin.session.force_logout', 'authentication'],
        ['economy.policy.activated', 'administration'],
        ['admin.login_policy.allowlist_set', 'administration'],
        ['admin.wallet.failed', 'administration'],
      ];

      for (const [action, category] of expected) {
        const { rows } = await migrator.query<{ category: string }>(
          'SELECT public.audit_retention_category($1) AS category',
          [action],
        );
        expect(rows[0]?.category, action).toBe(category);
      }
    });
  });
});
