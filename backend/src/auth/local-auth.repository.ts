import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne } from '../core/db';
import { randomToken, sha256 } from './crypto';

export interface LocalCredentialRow {
  readonly user_id: string;
  readonly password_verifier: string;
}

export interface CompletedLocalLoginRow {
  readonly user_id: string;
  readonly session_id: string;
  readonly is_new: boolean;
}

export interface CompletedLocalLogin extends CompletedLocalLoginRow {
  readonly token: string;
  readonly csrfToken: string;
}

@Injectable()
export class LocalAuthRepository {
  constructor(readonly pool: Queryable) {}

  async startRegistration(options: {
    readonly preAuthSessionId: string;
    readonly email: string;
    readonly emailHash: string;
    readonly passwordVerifier: string;
    readonly displayName: string;
    readonly verificationTokenHash: string;
  }): Promise<boolean> {
    const row = await queryOne<{ readonly accepted: boolean }>(
      this.pool,
      `SELECT public.auth_start_local_registration($1,$2,$3,$4,$5,$6) AS accepted`,
      [
        options.preAuthSessionId,
        options.email,
        options.emailHash,
        options.passwordVerifier,
        options.displayName,
        options.verificationTokenHash,
      ],
    );
    return row?.accepted === true;
  }

  async credential(emailHash: string): Promise<LocalCredentialRow | null> {
    return queryOne<LocalCredentialRow>(
      this.pool,
      'SELECT * FROM public.auth_local_credential_for_login($1)',
      [emailHash],
    );
  }

  async completeRegistration(verificationToken: string): Promise<CompletedLocalLogin> {
    const token = randomToken();
    const csrfToken = randomToken();
    const row = await queryOne<CompletedLocalLoginRow>(
      this.pool,
      'SELECT * FROM public.auth_complete_local_registration_by_token($1,$2,$3)',
      [sha256(verificationToken), sha256(token), sha256(csrfToken)],
    );
    if (!row) throw new Error('local registration was not completed');
    return { ...row, token, csrfToken };
  }

  async startPasswordReset(emailHash: string, tokenHash: string): Promise<boolean> {
    const row = await queryOne<{ readonly accepted: boolean }>(
      this.pool,
      'SELECT public.auth_start_local_password_reset($1,$2) AS accepted',
      [emailHash, tokenHash],
    );
    return row?.accepted === true;
  }

  async completePasswordReset(token: string, passwordVerifier: string): Promise<boolean> {
    const row = await queryOne<{ readonly completed: boolean }>(
      this.pool,
      'SELECT public.auth_complete_local_password_reset($1,$2) AS completed',
      [sha256(token), passwordVerifier],
    );
    return row?.completed === true;
  }

  async completeLogin(
    preAuthSessionId: string,
    userId: string,
    emailHash: string,
  ): Promise<CompletedLocalLogin> {
    const token = randomToken();
    const csrfToken = randomToken();
    const row = await queryOne<CompletedLocalLoginRow>(
      this.pool,
      'SELECT * FROM public.auth_complete_local_login($1,$2,$3,$4,$5)',
      [preAuthSessionId, userId, emailHash, sha256(token), sha256(csrfToken)],
    );
    if (!row) throw new Error('local login was not completed');
    return { ...row, token, csrfToken };
  }
}
