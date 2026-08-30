import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * The administrator's second authentication factor.
 *
 * Sign-in is OAuth-only, so until now whoever held the Discord or Google
 * account held the operations console — and since the two-person approval
 * rule was retired, that console is every power in the system at once. This
 * is TOTP (RFC 6238), which needs no new browser API and no relying-party
 * registration; WebAuthn is the better factor and is deliberately left for
 * later, because it needs a credential store, an attestation policy and a
 * recovery path that do not exist here yet.
 *
 * The shared secret is sealed here, with a key that lives only in the
 * deployment's environment, and only the sealed form is ever handed to
 * PostgreSQL. That is the point: reading the database must not be enough to
 * produce a working code. Everything the application must *not* be trusted to
 * decide on its own — is the credential confirmed, is the claimed step
 * plausibly now, has it already been spent — is decided by
 * packages/database/migrations/058-admin-second-factor.sql.
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const SECRET_BYTES = 20;
const NONCE_BYTES = 12;
const TAG_BYTES = 16;

export class TotpConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TotpConfigurationError';
  }
}

export interface TotpSealingKey {
  readonly keyId: string;
  readonly key: Buffer;
}

/**
 * Reads the sealing key out of the environment.
 *
 * Returns null rather than throwing when it is absent: a deployment without
 * the key must boot and answer "the second factor is unavailable" on the
 * routes that need it, exactly as every other provider in this codebase
 * degrades, instead of refusing to start and taking the member-facing half of
 * the site down with it.
 */
export function sealingKeyFrom(env: NodeJS.ProcessEnv): TotpSealingKey | null {
  const raw = env.ADMIN_TOTP_ENCRYPTION_KEY;
  if (!raw) return null;
  const key = /^[0-9a-fA-F]{64}$/.test(raw) ? Buffer.from(raw, 'hex') : Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new TotpConfigurationError(
      'ADMIN_TOTP_ENCRYPTION_KEY must be 32 bytes, given as 64 hex characters or base64',
    );
  }
  const keyId = env.ADMIN_TOTP_KEY_ID ?? 'default';
  if (!/^[a-z0-9][a-z0-9_.:-]{0,63}$/.test(keyId)) {
    throw new TotpConfigurationError('ADMIN_TOTP_KEY_ID must be a short lowercase identifier');
  }
  return { keyId, key };
}

export function generateSecret(): Buffer {
  return randomBytes(SECRET_BYTES);
}

export function base32Encode(value: Buffer): string {
  let bits = 0;
  let accumulator = 0;
  let encoded = '';
  for (const byte of value) {
    accumulator = (accumulator << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      // `?? ''` for noUncheckedIndexedAccess, not for safety: the mask is
      // five bits and the alphabet is thirty-two characters long.
      encoded += BASE32_ALPHABET[(accumulator >>> bits) & 31] ?? '';
    }
  }
  if (bits > 0) encoded += BASE32_ALPHABET[(accumulator << (5 - bits)) & 31] ?? '';
  return encoded;
}

/**
 * `nonce || tag || ciphertext`, base64. The nonce travels with the value
 * because it must never repeat under one key and is not secret; the tag is
 * what makes a tampered ciphertext fail to open rather than decrypt to
 * something else.
 */
export function sealSecret(secret: Buffer, sealing: TotpSealingKey): string {
  const nonce = randomBytes(NONCE_BYTES);
  const cipher = createCipheriv('aes-256-gcm', sealing.key, nonce);
  const ciphertext = Buffer.concat([cipher.update(secret), cipher.final()]);
  return Buffer.concat([nonce, cipher.getAuthTag(), ciphertext]).toString('base64');
}

export function openSecret(sealed: string, sealing: TotpSealingKey): Buffer {
  const raw = Buffer.from(sealed, 'base64');
  if (raw.length <= NONCE_BYTES + TAG_BYTES) throw new Error('sealed secret is malformed');
  const nonce = raw.subarray(0, NONCE_BYTES);
  const tag = raw.subarray(NONCE_BYTES, NONCE_BYTES + TAG_BYTES);
  const decipher = createDecipheriv('aes-256-gcm', sealing.key, nonce);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(raw.subarray(NONCE_BYTES + TAG_BYTES)), decipher.final()]);
}

export function currentStep(periodSeconds: number, now: number = Date.now()): number {
  return Math.floor(now / 1000 / periodSeconds);
}

export function codeForStep(secret: Buffer, step: number, digits: number): string {
  const counter = Buffer.alloc(8);
  // Node's writeBigUInt64BE is the only way to fill all eight bytes; a step
  // fits in 32 bits until the year 2106, but writing four bytes and leaving
  // four zeroed is the kind of shortcut that becomes a mystery later.
  counter.writeBigUInt64BE(BigInt(step));
  const digest = createHmac('sha1', secret).update(counter).digest();
  // Dynamic truncation, RFC 4226 §5.4: the low nibble of the last byte picks
  // where in the digest the code is read from.
  const offset = (digest[digest.length - 1] ?? 0) & 0x0f;
  const binary =
    (((digest[offset] ?? 0) & 0x7f) << 24) |
    (((digest[offset + 1] ?? 0) & 0xff) << 16) |
    (((digest[offset + 2] ?? 0) & 0xff) << 8) |
    ((digest[offset + 3] ?? 0) & 0xff);
  return String(binary % 10 ** digits).padStart(digits, '0');
}

/**
 * Which step a code belongs to, or null.
 *
 * One step either side, which is the usual tolerance for clock skew between a
 * phone and a server. The comparison is constant-time — a code is a six-digit
 * secret, and a comparison that returns early leaks how much of it was right.
 *
 * The step is returned rather than a boolean because the database refuses a
 * step it has already seen; without it, a code observed on the wire could be
 * replayed for the rest of its window.
 */
export function verifyCode(
  secret: Buffer,
  code: string,
  { digits, periodSeconds, now = Date.now() }: {
    readonly digits: number;
    readonly periodSeconds: number;
    readonly now?: number;
  },
): number | null {
  if (!new RegExp(`^[0-9]{${digits}}$`).test(code)) return null;
  const supplied = Buffer.from(code, 'utf8');
  const step = currentStep(periodSeconds, now);
  for (const candidate of [step, step - 1, step + 1]) {
    const expected = Buffer.from(codeForStep(secret, candidate, digits), 'utf8');
    if (expected.length === supplied.length && timingSafeEqual(expected, supplied)) return candidate;
  }
  return null;
}

/**
 * The `otpauth://` URI an authenticator app scans. The label carries the
 * deployment's host rather than the member's display name: an operator's name
 * is personal data and the app only needs to tell one account from another.
 */
export function otpauthUri({
  secret,
  issuer,
  account,
  digits,
  periodSeconds,
}: {
  readonly secret: Buffer;
  readonly issuer: string;
  readonly account: string;
  readonly digits: number;
  readonly periodSeconds: number;
}): string {
  const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(account)}`;
  const parameters = new URLSearchParams({
    secret: base32Encode(secret),
    issuer,
    algorithm: 'SHA1',
    digits: String(digits),
    period: String(periodSeconds),
  });
  return `otpauth://totp/${label}?${parameters.toString()}`;
}
