import { describe, expect, it } from 'vitest';
import { hashPassword, normalizePassword, verifyPassword } from './password-hasher';

describe('password-hasher', () => {
  it('stores Argon2id parameters and verifies the full password', async () => {
    const password = 'correct horse battery staple';
    const verifier = await hashPassword(password);
    expect(verifier).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
    await expect(verifyPassword(password, verifier)).resolves.toBe(true);
    await expect(verifyPassword(`${password}!`, verifier)).resolves.toBe(false);
  });

  it('normalizes Unicode with NFC before hashing', () => {
    expect(normalizePassword('e\u0301'.repeat(15))).toBe('é'.repeat(15));
  });

  it('rejects malformed verifier strings', async () => {
    await expect(verifyPassword('anything at all', 'not-a-verifier')).resolves.toBe(false);
  });
});
