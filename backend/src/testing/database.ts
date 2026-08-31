import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Test-only helpers. Not imported by anything the application ships.
 */

export function databaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  // Convenience for local runs: packages/database/.env is gitignored and
  // holds a scratch database's URL.
  try {
    const text = readFileSync(join(__dirname, '../../../packages/database/.env'), 'utf8');
    return /^DATABASE_URL=(.+)$/m.exec(text)?.[1]?.trim();
  } catch {
    return undefined;
  }
}

interface PostgresErrorLike {
  readonly code?: string;
  readonly message?: string;
}

function asPostgresError(error: unknown): PostgresErrorLike {
  return typeof error === 'object' && error !== null ? (error as PostgresErrorLike) : {};
}

/**
 * Distinguishes a lost GRANT from a function refusing the caller's role.
 *
 * Both arrive as SQLSTATE 42501. Fifteen migrations raise it deliberately —
 * `game_catalog_operator` answers 'operator role required',
 * `admin_latest_economy_reconciliation_health` answers 'active approver role
 * required for reconciliation health' — and those refusals are the security
 * model working. Only PostgreSQL's own privilege check phrases the message as
 * "permission denied for ...", and only that means the deployment is broken.
 *
 * An earlier version of these tests asserted `code !== '42501'` outright,
 * which would have failed on every correct role refusal and, worse, invited
 * someone to delete the assertion rather than sharpen it.
 */
export function isMissingGrant(error: unknown): boolean {
  const { code, message } = asPostgresError(error);
  return code === '42501' && typeof message === 'string' && message.startsWith('permission denied');
}

/** Runs `attempt`, returning the rejection reason, or null if it resolved. */
export async function rejectionOf(attempt: () => Promise<unknown>): Promise<unknown> {
  return attempt().then(
    () => null,
    (error: unknown) => error,
  );
}

/** Just enough of `pg`'s client to arrange a fixture, without importing its types. */
interface TestClient {
  query(text: string, values?: readonly unknown[]): Promise<unknown>;
}

/**
 * Makes a member's credit grade one that actually lends.
 *
 * 096 applies `bank_credit_policies.credit_limit`, which 077 had deliberately
 * left unenforced, so `bank_borrow` now refuses the seeded 'new' grade
 * outright -- section 14.4's 신규 대출 불가. Every test that borrows has to
 * satisfy that first, and the two things `bank_credit_grade` tests are the
 * account's age in Seoul days and the number of rows in
 * `work_reward_receipts`. So those are the two things this arranges, and it
 * arranges them directly rather than by walking assign-submit-verify ten
 * times: the loan is what those tests are about, not the work loop.
 *
 * Runs as the schema owner, inside the caller's transaction, so it belongs in
 * a `rolledBack` block like everything else that writes here.
 */
export async function reachLendingGrade(client: TestClient, actor: string): Promise<void> {
  await client.query(
    `UPDATE public.users SET created_at = clock_timestamp() - interval '10 days' WHERE id = $1`,
    [actor],
  );
  const task = (await client.query(
    "SELECT id::text AS id FROM public.work_task_catalog WHERE code = 'logistics_sorting'",
  )) as { rows: readonly { id: string }[] };
  const taskId = task.rows[0]?.id;
  if (taskId === undefined) throw new Error('the seeded task catalogue is missing logistics_sorting');

  for (let paid = 0; paid < 10; paid += 1) {
    const assignment = randomUUID();
    await client.query(
      `INSERT INTO public.work_assignments (id, user_id, task_id, expires_at)
       VALUES ($1, $2, $3, clock_timestamp() + interval '1 day')`,
      [assignment, actor, taskId],
    );
    await client.query(
      `INSERT INTO public.work_reward_receipts
         (idempotency_key, user_id, assignment_id, reward_amount, experience_amount)
       VALUES ($1, $2, $3, 10, 10)`,
      [randomUUID(), actor, assignment],
    );
  }
}
