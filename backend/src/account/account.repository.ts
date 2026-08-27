import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DISCORD_SNOWFLAKE = /^\d{16,22}$/;

/** The two OAuth identity providers this application supports linking. */
export type IdentityProvider = 'discord' | 'google';

function isIdentityProvider(value: string): value is IdentityProvider {
  return value === 'discord' || value === 'google';
}

export class AccountInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccountInputError';
  }
}

export function requireAccountUuid(value: unknown, field: string): string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new AccountInputError(`${field} must be a UUID`);
  }
  return value.toLowerCase();
}

export function requireIdentityProvider(value: unknown): IdentityProvider {
  if (typeof value !== 'string' || !isIdentityProvider(value)) {
    throw new AccountInputError('OAuth provider must be discord or google');
  }
  return value;
}

export function requireVerifiedSubject(provider: unknown, value: unknown): string {
  const normalizedProvider = requireIdentityProvider(provider);
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length > 255 ||
    value.trim() !== value
  ) {
    throw new AccountInputError('verified OAuth subject is invalid');
  }
  if (normalizedProvider === 'discord' && !DISCORD_SNOWFLAKE.test(value)) {
    throw new AccountInputError('verified Discord subject must be an exact snowflake');
  }
  return value;
}

export function normalizeVerifiedDisplayName(value: unknown): string {
  if (typeof value !== 'string')
    throw new AccountInputError('verified OAuth display name is required');
  const normalized = value.replace(/\s+/g, ' ').trim().slice(0, 120);
  if (!normalized) throw new AccountInputError('verified OAuth display name is required');
  return normalized;
}

/** Row returned by account_list_my_identities (packages/database/migrations/010-account-lifecycle.sql). */
export interface LinkedIdentityRow {
  readonly identity_id: string;
  readonly provider: string;
  readonly display_name: string;
  readonly linked_at: Date;
}

/**
 * Row returned by account_link_oauth_identity. Defined in
 * packages/database/migrations/010-account-lifecycle.sql; the whitespace-normalization
 * fix in packages/database/migrations/012-account-link-display-name-fix.sql recreates
 * the function with the same result columns.
 */
export interface LinkOAuthIdentityRow {
  readonly identity_id: string;
  readonly provider: string;
  readonly display_name: string;
  readonly linked: boolean;
}

/** Row returned by account_unlink_identity (packages/database/migrations/010-account-lifecycle.sql). */
export interface UnlinkIdentityRow {
  readonly identity_id: string;
}

/**
 * Row returned by account_soft_delete. Defined in
 * packages/database/migrations/010-account-lifecycle.sql; the RETURNING-column
 * qualification fix in packages/database/migrations/011-account-soft-delete-fix.sql
 * recreates the function with the same result columns.
 */
export interface SoftDeleteRow {
  readonly deleted_at: Date;
  readonly revoked_session_count: number;
  readonly replayed: boolean;
}

export interface LinkVerifiedIdentityInput {
  readonly actorUserId: unknown;
  readonly provider: unknown;
  readonly providerSubject: unknown;
  readonly displayName: unknown;
}

export interface UnlinkIdentityInput {
  readonly actorUserId: unknown;
  readonly identityId: unknown;
}

export interface SoftDeleteInput {
  readonly actorUserId: unknown;
}

/**
 * The account-lifecycle contract AccountService depends on. PostgresAccountRepository
 * is the production implementation; tests may supply any object shaped like this.
 */
export interface AccountRepository {
  linkedIdentities(actorUserId: unknown): Promise<readonly LinkedIdentityRow[]>;
  linkVerifiedIdentity(input: LinkVerifiedIdentityInput): Promise<LinkOAuthIdentityRow>;
  unlinkIdentity(input: UnlinkIdentityInput): Promise<UnlinkIdentityRow>;
  softDelete(input: SoftDeleteInput): Promise<SoftDeleteRow>;
}

/**
 * Account lifecycle database gateway.
 *
 * Every method invokes a SECURITY DEFINER function. It deliberately has no
 * direct identity/user/consent SQL path, so a caller cannot enumerate account
 * records or write lifecycle state outside the database invariants.
 */
export class PostgresAccountRepository implements AccountRepository {
  readonly pool: Queryable;

  constructor(pool: Queryable) {
    if (!pool || typeof pool.query !== 'function')
      throw new TypeError('a PostgreSQL pool is required');
    this.pool = pool;
  }

  async linkedIdentities(actorUserId: unknown): Promise<readonly LinkedIdentityRow[]> {
    const actor = requireAccountUuid(actorUserId, 'authenticated user id');
    return queryRows<LinkedIdentityRow>(
      this.pool,
      `SELECT
         identity_id::text AS identity_id,
         provider::text AS provider,
         display_name,
         linked_at
       FROM public.account_list_my_identities($1)`,
      [actor],
    );
  }

  async linkVerifiedIdentity({
    actorUserId,
    provider,
    providerSubject,
    displayName,
  }: LinkVerifiedIdentityInput): Promise<LinkOAuthIdentityRow> {
    const actor = requireAccountUuid(actorUserId, 'authenticated user id');
    const verifiedProvider = requireIdentityProvider(provider);
    const verifiedSubject = requireVerifiedSubject(verifiedProvider, providerSubject);
    const verifiedDisplayName = normalizeVerifiedDisplayName(displayName);
    const row = await queryOne<LinkOAuthIdentityRow>(
      this.pool,
      `SELECT
         identity_id::text AS identity_id,
         provider::text AS provider,
         display_name,
         linked
       FROM public.account_link_oauth_identity($1, $2::public.identity_provider, $3, $4)`,
      [actor, verifiedProvider, verifiedSubject, verifiedDisplayName],
    );
    if (!row || !row.identity_id)
      throw new Error('database did not return an identity-link receipt');
    return row;
  }

  async unlinkIdentity({
    actorUserId,
    identityId,
  }: UnlinkIdentityInput): Promise<UnlinkIdentityRow> {
    const actor = requireAccountUuid(actorUserId, 'authenticated user id');
    const identity = requireAccountUuid(identityId, 'identity id');
    const row = await queryOne<UnlinkIdentityRow>(
      this.pool,
      'SELECT public.account_unlink_identity($1, $2)::text AS identity_id',
      [actor, identity],
    );
    if (!row || !row.identity_id)
      throw new Error('database did not return an identity-unlink receipt');
    return row;
  }

  async softDelete({ actorUserId }: SoftDeleteInput): Promise<SoftDeleteRow> {
    const actor = requireAccountUuid(actorUserId, 'authenticated user id');
    const row = await queryOne<SoftDeleteRow>(
      this.pool,
      `SELECT deleted_at, revoked_session_count, replayed
       FROM public.account_soft_delete($1)`,
      [actor],
    );
    if (!row || !row.deleted_at)
      throw new Error('database did not return an account-deletion receipt');
    return row;
  }
}
