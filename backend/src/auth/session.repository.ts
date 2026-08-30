import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne } from '../core/db';
import { randomToken, sha256 } from './crypto';

const SESSION_INTERVAL = "interval '8 hours'";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

type ChallengePurpose = 'login' | 'link' | 'reauth';

function isChallengePurpose(value: unknown): value is ChallengePurpose {
  return value === 'login' || value === 'link' || value === 'reauth';
}

/**
 * The session shape every route depends on. Keep the snake_case `user_id` —
 * it comes straight from the auth_sessions row and test doubles across the
 * suite produce it under that name.
 */
export interface Session {
  readonly id: string;
  readonly user_id: string | null;
}

/**
 * Full row shape of auth_sessions. Base columns from
 * packages/database/migrations/002-auth-and-api.sql; prelogin_* columns added in
 * packages/database/migrations/004-login-consent-gate.sql; reauthenticated_at added in
 * packages/database/migrations/031-step-up-reauthentication.sql.
 */
export interface AuthSessionRow extends Session {
  readonly token_hash: string;
  readonly csrf_hash: string;
  readonly expires_at: Date;
  readonly created_at: Date;
  readonly revoked_at: Date | null;
  readonly prelogin_consent_version_id: string | null;
  readonly prelogin_age_confirmed: boolean;
  readonly prelogin_consented_at: Date | null;
  readonly reauthenticated_at: Date | null;
  /** admin_* columns added in packages/database/migrations/057-superadmin-authority-and-admin-sessions.sql. */
  readonly admin_opened_at: Date | null;
  readonly admin_last_seen_at: Date | null;
  readonly admin_closed_at: Date | null;
  readonly admin_rotated_from: string | null;
}

/**
 * What the console session is doing, from
 * packages/database/migrations/057-superadmin-authority-and-admin-sessions.sql
 * (admin_session_touch). `none` is a live member session that has not entered
 * the console; the other three each need a different thing said to the
 * operator, which is why this is a state rather than a boolean.
 */
export type AdminSessionState = 'open' | 'idle_locked' | 'expired' | 'closed' | 'none';

export interface AdminSessionStatus {
  readonly state: AdminSessionState;
  readonly expiresAt: Date | null;
  readonly idleExpiresAt: Date | null;
}

export interface OpenedAdminSession extends AdminSessionStatus {
  readonly sessionId: string;
  readonly token: string;
  readonly csrfToken: string;
}

/** Row returned by the auth_sessions INSERT...RETURNING in create() (packages/database/migrations/002-auth-and-api.sql). */
export interface CreatedSessionRow extends Session {
  readonly expires_at: Date;
}

export interface CreatedSession extends CreatedSessionRow {
  readonly token: string;
  readonly csrfToken: string;
}

type IdRow = { readonly id: string };

/** Row shape of consent_versions (packages/database/init/001-economy-core.sql). */
export interface ConsentVersionRow {
  readonly id: string;
  readonly terms_version: string;
  readonly privacy_version: string;
  readonly published_at: Date;
}

/** Row returned by the prelogin-consent RETURNING clause (columns added in packages/database/migrations/004-login-consent-gate.sql). */
export interface PreloginConsentRow {
  readonly id: string;
  readonly prelogin_consent_version_id: string | null;
}

/**
 * The subset of an OAuth challenge that createChallenge actually reads.
 * `OAuthChallenge` from ./crypto satisfies this structurally and is what
 * callers pass.
 *
 * Deliberately narrower than that type: it omits `state` and `nonce`, which
 * are the clear-text halves this method must never persist. Widening it to
 * the full type would make storing them a type-correct mistake.
 */
export interface OAuthChallengeLike {
  readonly stateHash: string;
  readonly provider: string;
  readonly codeVerifier: string;
  readonly nonceHash: string;
  readonly redirectUri: string;
}

/**
 * Row returned by consumeChallenge's RETURNING clause. state_hash/session_id/
 * provider/code_verifier/redirect_uri/expires_at/consumed_at/created_at from
 * packages/database/migrations/002-auth-and-api.sql; nonce replaced by nonce_hash in
 * packages/database/migrations/006-auth-hardening.sql; purpose added in
 * packages/database/migrations/031-step-up-reauthentication.sql.
 */
export interface OAuthChallengeRow {
  readonly code_verifier: string;
  readonly nonce_hash: string;
  readonly redirect_uri: string;
  readonly purpose: string;
}

/** Row returned by auth_complete_oauth_login (packages/database/migrations/006-auth-hardening.sql). */
export interface CompletedOAuthLoginRow {
  readonly user_id: string;
  readonly session_id: string;
  readonly is_new: boolean;
}

export interface CompletedOAuthLogin extends CompletedOAuthLoginRow {
  readonly token: string;
  readonly csrfToken: string;
}

@Injectable()
export class SessionRepository {
  readonly pool: Queryable;

  constructor(pool: Queryable) {
    this.pool = pool;
  }

  async create(): Promise<CreatedSession> {
    const token = randomToken();
    const csrfToken = randomToken();
    const session = await queryOne<CreatedSessionRow>(
      this.pool,
      `INSERT INTO auth_sessions(id, token_hash, csrf_hash, expires_at)
       VALUES($1,$2,$3,now()+${SESSION_INTERVAL})
       RETURNING id, user_id, expires_at`,
      [randomUUID(), sha256(token), sha256(csrfToken)],
    );
    if (!session) throw new Error('session was not created');
    return { ...session, token, csrfToken };
  }

  async get(token: unknown): Promise<AuthSessionRow | null> {
    if (typeof token !== 'string' || token.length < 32 || token.length > 512) return null;
    return queryOne<AuthSessionRow>(
      this.pool,
      `SELECT * FROM auth_sessions
       WHERE token_hash=$1 AND revoked_at IS NULL AND expires_at>now()`,
      [sha256(token)],
    );
  }

  async rotateCsrf(sessionId: string): Promise<string> {
    const csrfToken = randomToken();
    const session = await queryOne<IdRow>(
      this.pool,
      `UPDATE auth_sessions SET csrf_hash=$2
       WHERE id=$1 AND revoked_at IS NULL AND expires_at>now()
       RETURNING id`,
      [sessionId, sha256(csrfToken)],
    );
    if (!session) throw new Error('active session not found');
    return csrfToken;
  }

  async verifyCsrf(sessionId: string, csrfToken: unknown): Promise<boolean> {
    if (typeof csrfToken !== 'string' || csrfToken.length < 32 || csrfToken.length > 512)
      return false;
    const row = await queryOne<IdRow>(
      this.pool,
      `SELECT id FROM auth_sessions
       WHERE id=$1 AND csrf_hash=$2 AND revoked_at IS NULL AND expires_at>now()`,
      [sessionId, sha256(csrfToken)],
    );
    return Boolean(row);
  }

  async currentConsentVersion(): Promise<ConsentVersionRow | null> {
    return queryOne<ConsentVersionRow>(
      this.pool,
      `SELECT id, terms_version, privacy_version, published_at
       FROM consent_versions
       WHERE published_at <= now()
       ORDER BY published_at DESC, id DESC
       LIMIT 1`,
    );
  }

  async grantPreloginConsent(
    sessionId: string,
    acknowledgement: unknown,
  ): Promise<PreloginConsentRow> {
    if (
      !isRecord(acknowledgement) ||
      !acknowledgement.termsCompleted ||
      !acknowledgement.privacyCompleted ||
      !acknowledgement.ageConfirmed
    ) {
      throw new Error('full policy acknowledgement and age confirmation required');
    }
    if (
      typeof acknowledgement.termsVersion !== 'string' ||
      typeof acknowledgement.privacyVersion !== 'string'
    ) {
      throw new Error('policy version acknowledgement required');
    }
    const session = await queryOne<PreloginConsentRow>(
      this.pool,
      `WITH current_version AS (
         SELECT id FROM consent_versions
         WHERE published_at <= now() AND terms_version=$2 AND privacy_version=$3
         ORDER BY published_at DESC, id DESC LIMIT 1
       )
       UPDATE auth_sessions s
       SET prelogin_consent_version_id=current_version.id,
           prelogin_age_confirmed=true,
           prelogin_consented_at=now()
       FROM current_version
       WHERE s.id=$1 AND s.user_id IS NULL AND s.revoked_at IS NULL AND s.expires_at>now()
       RETURNING s.id, s.prelogin_consent_version_id`,
      [sessionId, acknowledgement.termsVersion, acknowledgement.privacyVersion],
    );
    if (!session) throw new Error('active pre-login session or published policy not found');
    return session;
  }

  async hasCurrentPreloginConsent(sessionId: string): Promise<boolean> {
    const row = await queryOne<IdRow>(
      this.pool,
      `WITH current_version AS (
         SELECT id FROM consent_versions WHERE published_at <= now()
         ORDER BY published_at DESC, id DESC LIMIT 1
       )
       SELECT s.id
       FROM auth_sessions s JOIN current_version c ON c.id=s.prelogin_consent_version_id
       WHERE s.id=$1 AND s.user_id IS NULL AND s.prelogin_age_confirmed
         AND s.prelogin_consented_at IS NOT NULL AND s.revoked_at IS NULL AND s.expires_at>now()`,
      [sessionId],
    );
    return Boolean(row);
  }

  async hasCurrentUserConsent(sessionId: string): Promise<boolean> {
    const row = await queryOne<{ readonly has_current_consent: boolean }>(
      this.pool,
      'SELECT public.auth_session_has_current_consent($1) AS has_current_consent',
      [sessionId],
    );
    return row?.has_current_consent === true;
  }

  async createChallenge(
    sessionId: string,
    challenge: OAuthChallengeLike,
    purpose: unknown = 'login',
  ): Promise<void> {
    if (!isChallengePurpose(purpose)) throw new TypeError('invalid OAuth challenge purpose');
    await this.pool.query(
      `INSERT INTO oauth_challenges(state_hash,session_id,provider,code_verifier,nonce_hash,redirect_uri,purpose,expires_at)
       VALUES($1,$2,$3,$4,$5,$6,$7,now()+interval '10 minutes')`,
      [
        challenge.stateHash,
        sessionId,
        challenge.provider,
        challenge.codeVerifier,
        challenge.nonceHash,
        challenge.redirectUri,
        purpose,
      ],
    );
  }

  async consumeChallenge({
    sessionId,
    provider,
    state,
  }: {
    readonly sessionId: string;
    readonly provider: string;
    readonly state: unknown;
  }): Promise<OAuthChallengeRow | null> {
    if (typeof state !== 'string' || state.length < 32 || state.length > 512) return null;
    return queryOne<OAuthChallengeRow>(
      this.pool,
      `UPDATE oauth_challenges
       SET consumed_at=now()
       WHERE state_hash=$1 AND session_id=$2 AND provider=$3
         AND consumed_at IS NULL AND expires_at>now()
       RETURNING code_verifier, nonce_hash, redirect_uri, purpose`,
      [sha256(state), sessionId, provider],
    );
  }

  async completeOAuthLogin({
    preAuthSessionId,
    provider,
    subject,
    displayName,
  }: {
    readonly preAuthSessionId: string;
    readonly provider: string;
    readonly subject: string;
    readonly displayName: string;
  }): Promise<CompletedOAuthLogin> {
    const token = randomToken();
    const csrfToken = randomToken();
    const login = await queryOne<CompletedOAuthLoginRow>(
      this.pool,
      `SELECT * FROM auth_complete_oauth_login($1,$2,$3,$4,$5,$6)`,
      [preAuthSessionId, provider, subject, displayName, sha256(token), sha256(csrfToken)],
    );
    if (!login) throw new Error('OAuth login was not completed');
    await this.pool.query(
      `UPDATE auth_sessions SET reauthenticated_at=now()
       WHERE id=$1 AND user_id IS NOT NULL AND revoked_at IS NULL AND expires_at>now()`,
      [login.session_id],
    );
    return { ...login, token, csrfToken };
  }

  async markReauthenticated(
    sessionId: string,
    provider: string,
    subject: string,
  ): Promise<boolean> {
    const row = await queryOne<{ readonly reauthenticated: boolean }>(
      this.pool,
      'SELECT public.auth_mark_session_reauthenticated($1,$2::public.identity_provider,$3) AS reauthenticated',
      [sessionId, provider, subject],
    );
    return row?.reauthenticated === true;
  }

  async hasRecentReauthentication(sessionId: string, maxAgeSeconds = 900): Promise<boolean> {
    const row = await queryOne<{ readonly recent: boolean }>(
      this.pool,
      'SELECT public.auth_session_has_recent_reauthentication($1,$2) AS recent',
      [sessionId, maxAgeSeconds],
    );
    return row?.recent === true;
  }

  async revoke(sessionId: string): Promise<void> {
    await this.pool.query(
      `UPDATE auth_sessions SET revoked_at=coalesce(revoked_at, now()) WHERE id=$1`,
      [sessionId],
    );
  }

  /**
   * Enters the operations console, which rotates the session.
   *
   * The token that reaches the console is not the token that was in the
   * browser a moment ago: `admin_session_open` issues a new row and revokes
   * the old one, so a session token captured earlier cannot be replayed into
   * the console. The caller gets the clear-text token back exactly once, the
   * way login does, and the API relays it as a `set-cookie`.
   *
   * The database refuses this without a reauthentication and a second factor
   * proved in the last five minutes; nothing here re-decides that.
   */
  async openAdminSession(sessionId: string, userId: string): Promise<OpenedAdminSession> {
    const token = randomToken();
    const csrfToken = randomToken();
    const row = await queryOne<{
      readonly session_id: string;
      readonly expires_at: Date;
      readonly idle_expires_at: Date;
    }>(
      this.pool,
      `SELECT session_id, expires_at, idle_expires_at
       FROM public.admin_session_open($1, $2, $3, $4)`,
      [sessionId, userId, sha256(token), sha256(csrfToken)],
    );
    if (!row) throw new Error('admin_session_open did not return a row');
    return {
      sessionId: row.session_id,
      token,
      csrfToken,
      state: 'open',
      expiresAt: row.expires_at,
      idleExpiresAt: row.idle_expires_at,
    };
  }

  async touchAdminSession(sessionId: string, userId: string): Promise<AdminSessionStatus> {
    const row = await queryOne<{
      readonly state: AdminSessionState;
      readonly expires_at: Date | null;
      readonly idle_expires_at: Date | null;
    }>(
      this.pool,
      'SELECT state, expires_at, idle_expires_at FROM public.admin_session_touch($1, $2)',
      [sessionId, userId],
    );
    if (!row) throw new Error('admin_session_touch did not return a row');
    return { state: row.state, expiresAt: row.expires_at, idleExpiresAt: row.idle_expires_at };
  }

  async closeAdminSession(sessionId: string, userId: string): Promise<boolean> {
    const row = await queryOne<{ readonly closed: boolean }>(
      this.pool,
      'SELECT public.admin_session_close($1, $2) AS closed',
      [sessionId, userId],
    );
    return row?.closed === true;
  }

  async forceLogout(input: {
    readonly idempotencyKey: string;
    readonly actorUserId: string;
    readonly targetUserId: string;
    readonly reason: string;
  }): Promise<{ readonly revokedSessions: number }> {
    const row = await queryOne<{ readonly revoked_sessions: number }>(
      this.pool,
      'SELECT revoked_sessions FROM public.admin_force_logout($1, $2, $3, $4)',
      [input.idempotencyKey, input.actorUserId, input.targetUserId, input.reason],
    );
    return { revokedSessions: row?.revoked_sessions ?? 0 };
  }
}
