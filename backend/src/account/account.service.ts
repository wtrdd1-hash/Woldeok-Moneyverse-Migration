import { Injectable } from '@nestjs/common';
import {
  AccountInputError,
  PostgresAccountRepository,
  normalizeVerifiedDisplayName,
  requireAccountUuid,
  requireIdentityProvider,
  requireVerifiedSubject,
} from './account.repository';
import type { AccountRepository, IdentityProvider, LinkedIdentityRow } from './account.repository';

export class AccountUnavailableError extends Error {
  constructor() {
    super('account is unavailable');
    this.name = 'AccountUnavailableError';
  }
}

export class AccountIdentityUnavailableError extends Error {
  constructor() {
    super('OAuth identity is unavailable');
    this.name = 'AccountIdentityUnavailableError';
  }
}

export class AccountLastIdentityError extends Error {
  constructor() {
    super('at least one sign-in method must remain');
    this.name = 'AccountLastIdentityError';
  }
}

export interface LinkedIdentitySummary {
  readonly identityId: string;
  readonly provider: IdentityProvider;
  readonly displayName: string;
  readonly linkedAt: string;
}

/**
 * An OAuth identity result already verified by OAuthClient.authenticate.
 * Every field is `unknown` until requireIdentityProvider / requireVerifiedSubject /
 * normalizeVerifiedDisplayName narrow it — this service does not extend trust
 * to callers just because the shape looks right.
 */
export interface VerifiedOAuthIdentity {
  readonly provider?: unknown;
  readonly subject?: unknown;
  readonly displayName?: unknown;
}

export interface LinkVerifiedIdentityResult {
  readonly identityId: string;
  readonly provider: IdentityProvider;
  readonly displayName: string;
  readonly linked: boolean;
}

export interface UnlinkIdentityResult {
  readonly identityId: string;
}

export interface SoftDeleteResult {
  readonly deletedAt: string;
  readonly revokedSessionCount: number;
  readonly replayed: boolean;
}

/**
 * Accepts a Date (the real pg driver's deserialization of a timestamptz
 * column) or a string (what test doubles and any future driver change might
 * hand back) — anything else fails the NaN check below.
 */
function timestamp(value: Date | string, field: string): string {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.valueOf())) throw new Error(`database returned an invalid ${field}`);
  return parsed.toISOString();
}

function nonNegativeSafeInteger(value: unknown, field: string): number {
  const integer = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(integer) || integer < 0)
    throw new Error(`database returned an invalid ${field}`);
  return integer;
}

function linkedIdentity(row: LinkedIdentityRow): LinkedIdentitySummary {
  const provider = requireIdentityProvider(row.provider);
  return {
    identityId: requireAccountUuid(row.identity_id, 'database identity id'),
    provider,
    displayName: normalizeVerifiedDisplayName(row.display_name),
    linkedAt: timestamp(row.linked_at, 'identity linked timestamp'),
  };
}

function pgErrorCode(error: unknown): string | undefined {
  if (error instanceof Error && 'code' in error && typeof error.code === 'string')
    return error.code;
  return undefined;
}

function lifecycleDatabaseError(error: unknown): unknown {
  const code = pgErrorCode(error);
  const message = error instanceof Error ? error.message : undefined;
  if (code === '23514' && message === 'the last OAuth identity cannot be removed') {
    return new AccountLastIdentityError();
  }
  if (code === '23505' && message === 'OAuth identity is unavailable') {
    return new AccountIdentityUnavailableError();
  }
  if (code === '22023' && message === 'OAuth identity is unavailable') {
    return new AccountIdentityUnavailableError();
  }
  if (code === '28000') return new AccountUnavailableError();
  return error;
}

/**
 * Application-facing account lifecycle use cases.
 *
 * `linkVerifiedOAuthIdentity` accepts only an identity result returned by the
 * already verified OAuth-token flow (OAuthClient.authenticate). Do not pass a
 * browser request body, Discord profile object, email address, or arbitrary
 * provider subject into it. The authenticated user ID is always supplied by
 * the server-side session boundary.
 */
@Injectable()
export class AccountService {
  readonly repository: AccountRepository;

  constructor(repository: AccountRepository) {
    if (
      !(repository instanceof PostgresAccountRepository) &&
      (!repository ||
        typeof repository.linkedIdentities !== 'function' ||
        typeof repository.linkVerifiedIdentity !== 'function' ||
        typeof repository.unlinkIdentity !== 'function' ||
        typeof repository.softDelete !== 'function')
    ) {
      throw new TypeError('an account repository is required');
    }
    this.repository = repository;
  }

  async linkedIdentities(authenticatedUserId: unknown): Promise<readonly LinkedIdentitySummary[]> {
    const actorUserId = requireAccountUuid(authenticatedUserId, 'authenticated user id');
    const rows = await this.repository.linkedIdentities(actorUserId);
    return rows.map(linkedIdentity);
  }

  async linkVerifiedOAuthIdentity(
    authenticatedUserId: unknown,
    verifiedIdentity: VerifiedOAuthIdentity | null | undefined,
  ): Promise<LinkVerifiedIdentityResult> {
    const actorUserId = requireAccountUuid(authenticatedUserId, 'authenticated user id');
    const provider = requireIdentityProvider(verifiedIdentity?.provider);
    const providerSubject = requireVerifiedSubject(provider, verifiedIdentity?.subject);
    const displayName = normalizeVerifiedDisplayName(verifiedIdentity?.displayName);
    try {
      const receipt = await this.repository.linkVerifiedIdentity({
        actorUserId,
        provider,
        providerSubject,
        displayName,
      });
      const returnedProvider = requireIdentityProvider(receipt.provider);
      if (returnedProvider !== provider || typeof receipt.linked !== 'boolean') {
        throw new Error('database returned an invalid identity-link receipt');
      }
      return {
        identityId: requireAccountUuid(receipt.identity_id, 'database identity id'),
        provider: returnedProvider,
        displayName: normalizeVerifiedDisplayName(receipt.display_name),
        linked: receipt.linked,
      };
    } catch (error) {
      throw lifecycleDatabaseError(error);
    }
  }

  async unlinkIdentity(
    authenticatedUserId: unknown,
    { identityId }: { readonly identityId?: unknown } = {},
  ): Promise<UnlinkIdentityResult> {
    const actorUserId = requireAccountUuid(authenticatedUserId, 'authenticated user id');
    const targetIdentityId = requireAccountUuid(identityId, 'identity id');
    try {
      const receipt = await this.repository.unlinkIdentity({
        actorUserId,
        identityId: targetIdentityId,
      });
      return { identityId: requireAccountUuid(receipt.identity_id, 'database identity id') };
    } catch (error) {
      throw lifecycleDatabaseError(error);
    }
  }

  async softDeleteAccount(authenticatedUserId: unknown): Promise<SoftDeleteResult> {
    const actorUserId = requireAccountUuid(authenticatedUserId, 'authenticated user id');
    try {
      const receipt = await this.repository.softDelete({ actorUserId });
      if (typeof receipt.replayed !== 'boolean')
        throw new Error('database returned an invalid account-deletion receipt');
      return {
        deletedAt: timestamp(receipt.deleted_at, 'account deletion timestamp'),
        revokedSessionCount: nonNegativeSafeInteger(
          receipt.revoked_session_count,
          'revoked session count',
        ),
        replayed: receipt.replayed,
      };
    } catch (error) {
      throw lifecycleDatabaseError(error);
    }
  }
}

export { AccountInputError };
