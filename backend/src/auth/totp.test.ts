import { describe, expect, it } from 'vitest';
import {
  base32Encode,
  codeForStep,
  currentStep,
  generateSecret,
  openSecret,
  otpauthUri,
  sealSecret,
  sealingKeyFrom,
  TotpConfigurationError,
  verifyCode,
} from './totp';

/**
 * The second factor's arithmetic, pinned.
 *
 * These run without a database, which matters: everything else about the
 * factor is enforced in SQL and only executes in CI, but a wrong HOTP
 * truncation would produce codes that are stable, self-consistent and
 * rejected by every authenticator app on earth — a failure that looks like
 * "the user typed it wrong" from every angle except this one.
 *
 * The vectors are RFC 6238 Appendix B, SHA-1, secret "12345678901234567890".
 */
const RFC_SECRET = Buffer.from('12345678901234567890', 'utf8');
const KEY = { keyId: 'test', key: Buffer.alloc(32, 7) };

describe('codeForStep', () => {
  it.each([
    [59, '94287082'],
    [1_111_111_109, '07081804'],
    [1_111_111_111, '14050471'],
    [1_234_567_890, '89005924'],
    [2_000_000_000, '69279037'],
    [20_000_000_000, '65353130'],
  ])('matches RFC 6238 at T=%i', (unixSeconds, expected) => {
    expect(codeForStep(RFC_SECRET, Math.floor(unixSeconds / 30), 8)).toBe(expected);
  });

  it('pads a short code to the requested width', () => {
    const code = codeForStep(RFC_SECRET, 1, 6);
    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[0-9]{6}$/);
  });
});

describe('verifyCode', () => {
  const now = 1_111_111_109_000;

  it('accepts the code for the current step and reports which step it was', () => {
    const step = currentStep(30, now);
    const code = codeForStep(RFC_SECRET, step, 6);
    expect(verifyCode(RFC_SECRET, code, { digits: 6, periodSeconds: 30, now })).toBe(step);
  });

  it('accepts one step either side, for a phone whose clock has drifted', () => {
    const step = currentStep(30, now);
    for (const candidate of [step - 1, step + 1]) {
      const code = codeForStep(RFC_SECRET, candidate, 6);
      expect(verifyCode(RFC_SECRET, code, { digits: 6, periodSeconds: 30, now })).toBe(candidate);
    }
  });

  it('refuses a code two steps away', () => {
    const code = codeForStep(RFC_SECRET, currentStep(30, now) + 2, 6);
    expect(verifyCode(RFC_SECRET, code, { digits: 6, periodSeconds: 30, now })).toBeNull();
  });

  it('refuses anything that is not the right number of digits', () => {
    for (const code of ['', '12345', '1234567', 'abcdef', '12345a']) {
      expect(verifyCode(RFC_SECRET, code, { digits: 6, periodSeconds: 30, now })).toBeNull();
    }
  });
});

describe('sealSecret', () => {
  it('round-trips a secret through the sealing key', () => {
    const secret = generateSecret();
    expect(openSecret(sealSecret(secret, KEY), KEY)).toEqual(secret);
  });

  // The property §10 asks for: what is stored must be useless on its own.
  it('produces a different ciphertext every time and hides the secret', () => {
    const secret = generateSecret();
    const first = sealSecret(secret, KEY);
    const second = sealSecret(secret, KEY);
    expect(first).not.toBe(second);
    expect(Buffer.from(first, 'base64').includes(secret)).toBe(false);
  });

  it('refuses to open a sealed secret with the wrong key', () => {
    const sealed = sealSecret(generateSecret(), KEY);
    expect(() => openSecret(sealed, { keyId: 'other', key: Buffer.alloc(32, 9) })).toThrow();
  });

  it('refuses to open a tampered ciphertext rather than returning something else', () => {
    const raw = Buffer.from(sealSecret(generateSecret(), KEY), 'base64');
    raw[raw.length - 1] = (raw[raw.length - 1] ?? 0) ^ 0xff;
    expect(() => openSecret(raw.toString('base64'), KEY)).toThrow();
  });
});

describe('sealingKeyFrom', () => {
  it('reports no key rather than throwing when none is configured', () => {
    expect(sealingKeyFrom({})).toBeNull();
  });

  it('accepts 32 bytes as hex and as base64', () => {
    expect(sealingKeyFrom({ ADMIN_TOTP_ENCRYPTION_KEY: 'a'.repeat(64) })?.key).toHaveLength(32);
    expect(
      sealingKeyFrom({ ADMIN_TOTP_ENCRYPTION_KEY: Buffer.alloc(32, 3).toString('base64') })?.key,
    ).toHaveLength(32);
  });

  it('refuses a key of the wrong length rather than sealing with it', () => {
    expect(() => sealingKeyFrom({ ADMIN_TOTP_ENCRYPTION_KEY: 'short' })).toThrow(
      TotpConfigurationError,
    );
  });

  it('names the key so a rotation can tell which rows it can still open', () => {
    expect(sealingKeyFrom({ ADMIN_TOTP_ENCRYPTION_KEY: 'a'.repeat(64) })?.keyId).toBe('default');
    expect(
      sealingKeyFrom({ ADMIN_TOTP_ENCRYPTION_KEY: 'a'.repeat(64), ADMIN_TOTP_KEY_ID: 'k2' })?.keyId,
    ).toBe('k2');
  });
});

describe('base32Encode and otpauthUri', () => {
  it('encodes the RFC 4648 example', () => {
    expect(base32Encode(Buffer.from('foobar', 'utf8'))).toBe('MZXW6YTBOI');
  });

  it('builds a URI an authenticator app can read', () => {
    const uri = otpauthUri({
      secret: RFC_SECRET,
      issuer: 'easy-scraping.com',
      account: '00000000-0000-4000-8000-000000000000',
      digits: 6,
      periodSeconds: 30,
    });
    expect(uri.startsWith('otpauth://totp/easy-scraping.com%3A')).toBe(true);
    expect(uri).toContain(`secret=${base32Encode(RFC_SECRET)}`);
    expect(uri).toContain('algorithm=SHA1');
    expect(uri).toContain('period=30');
  });
});
