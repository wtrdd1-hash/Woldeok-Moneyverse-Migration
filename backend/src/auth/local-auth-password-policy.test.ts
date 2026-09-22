import { describe, expect, it } from 'vitest';
import { acceptablePassword, suggestedEmailForKnownDomainTypo } from './local-auth.controller';

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
    expect(acceptablePassword('😀'.repeat(128))).toBe(true);
    expect(acceptablePassword('😀'.repeat(129))).toBe(false);
  });
});

describe('local auth email typo guard', () => {
  it('suggests the intended provider for known high-confidence domain typos', () => {
    expect(suggestedEmailForKnownDomainTypo('wtrdd@nvaer.com')).toBe('wtrdd@naver.com');
    expect(suggestedEmailForKnownDomainTypo('MEMBER@GAMIL.COM')).toBe('member@gmail.com');
  });

  it('does not rewrite unknown or legitimate domains', () => {
    expect(suggestedEmailForKnownDomainTypo('member@naver.com')).toBeNull();
    expect(suggestedEmailForKnownDomainTypo('member@example.com')).toBeNull();
  });
});
