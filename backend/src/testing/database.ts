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
