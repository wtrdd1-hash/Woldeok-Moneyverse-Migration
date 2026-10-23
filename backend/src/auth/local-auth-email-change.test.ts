import { describe, expect, it, vi } from 'vitest';
import { sha256 } from './crypto';
import { LocalAuthRepository } from './local-auth.repository';

describe('local login email change SQL contract (migration 215)', () => {
  it('binds all five arguments in order to the SECURITY DEFINER request function', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ accepted: true }] });
    const repository = new LocalAuthRepository({ query });
    const sessionId = '11111111-1111-4111-8111-111111111111';
    const userId = '22222222-2222-4222-8222-222222222222';
    const email = 'new@example.test';
    const hash = sha256(email);
    const tokenHash = sha256('verification-token');

    await expect(repository.startEmailChange(sessionId, userId, email, hash, tokenHash)).resolves.toBe(true);
    expect(query).toHaveBeenCalledWith(
      'SELECT public.auth_start_local_email_change($1,$2,$3,$4,$5) AS accepted',
      [sessionId, userId, email, hash, tokenHash],
    );
  });

  it('binds the hashed one-time verification token without sending the raw token', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ completed: true }] });
    const repository = new LocalAuthRepository({ query });

    await expect(repository.completeEmailChange('one-time-secret')).resolves.toBe(true);
    expect(query).toHaveBeenCalledWith(
      'SELECT public.auth_complete_local_email_change($1) AS completed',
      [sha256('one-time-secret')],
    );
  });

  it('does not falsely report success when the database declines either transition', async () => {
    const query = vi.fn().mockResolvedValueOnce({ rows: [{ accepted: false }] }).mockResolvedValueOnce({ rows: [] });
    const repository = new LocalAuthRepository({ query });
    await expect(repository.startEmailChange('s', 'u', 'e', 'h', 't')).resolves.toBe(false);
    await expect(repository.completeEmailChange('expired')).resolves.toBe(false);
  });
});
