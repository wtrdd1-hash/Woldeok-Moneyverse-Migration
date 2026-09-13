import { describe, expect, it } from 'vitest';
import { acceptablePassword } from './local-auth.controller';

describe('local auth password policy', () => {
  it('does not enforce a numeric minimum length for registration', () => {
    expect(acceptablePassword('a')).toBe(true);
    expect(acceptablePassword('간')).toBe(true);
  });

  it('still rejects an empty password', () => {
    expect(acceptablePassword('')).toBe(false);
  });

  it('still rejects obvious common passwords', () => {
    for (const password of ['1234', '123456', 'password', 'qwerty', 'letmein', 'admin', 'abc123']) {
      expect(acceptablePassword(password), password).toBe(false);
    }
  });

  it('keeps the documented technical maximum', () => {
    expect(acceptablePassword('a'.repeat(128))).toBe(true);
    expect(acceptablePassword('a'.repeat(129))).toBe(false);
  });
});
