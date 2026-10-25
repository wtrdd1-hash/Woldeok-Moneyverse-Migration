import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from 'node:crypto';

@Injectable()
export class EncryptionService {
  private readonly key: Buffer;
  private readonly decryptionKeys: readonly Buffer[];

  constructor() {
    const rawKey =
      process.env.DATA_ENCRYPTION_KEY ||
      process.env.INTERNAL_API_TOKEN ||
      process.env.APP_SECRET ||
      'moneyverse-default-vault-secure-encryption-key-32b';
    // 32바이트 고정 키 생성 (SHA-256 해시 파생)
    this.key = createHash('sha256').update(rawKey).digest();
    const legacyKeys = (process.env.LEGACY_DATA_ENCRYPTION_KEYS ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => createHash('sha256').update(value).digest());
    this.decryptionKeys = [this.key, ...legacyKeys].filter(
      (key, index, keys) => keys.findIndex((candidate) => candidate.equals(key)) === index,
    );
  }

  /**
   * Deterministic encryption for OAuth provider_subject so recurring logins map to the same user.
   * Derives a stable IV from HMAC(key, plaintext) to ensure reproducibility while preserving secrecy.
   */
  encryptDeterministic(plaintext: string | null | undefined): string | null {
    if (plaintext === null || plaintext === undefined) return null;
    if (plaintext === '') return '';
    if (plaintext.startsWith('enc:v1:')) {
      this.decrypt(plaintext); // Reuse requires an authenticated envelope, not a user-supplied prefix.
      return plaintext;
    }

    const iv = createHmac('sha256', this.key).update(plaintext).digest().subarray(0, 12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return `enc:v1:det:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  /**
   * The key-independent name for an OAuth identity (162).
   *
   * `encryptDeterministic` is only deterministic while the key holds, and a
   * key that moves turns every returning member into a stranger with an empty
   * wallet. This is what a login is found by instead: a plain SHA-256 of the
   * provider and the subject, which no deployment change can alter. The
   * encrypted subject stays beside it — this identifies, it does not disclose.
   */
  subjectHash(provider: string, subject: string): string {
    return createHash('sha256').update(`${provider}:${subject}`).digest('hex');
  }

  /**
   * Randomized AES-256-GCM encryption for general PII (display names, emails, profiles).
   * Result format: enc:v1:rnd:<iv_hex>:<tag_hex>:<ciphertext_hex>
   */
  encrypt(plaintext: string | null | undefined): string | null {
    if (plaintext === null || plaintext === undefined) return null;
    if (plaintext === '') return '';
    if (plaintext.startsWith('enc:v1:')) {
      this.decrypt(plaintext); // Reuse requires an authenticated envelope, not a user-supplied prefix.
      return plaintext;
    }

    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return `enc:v1:rnd:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  /**
   * Decrypts ciphertext string using AES-256-GCM.
   * Supports both enc:v1:rnd and enc:v1:det formats.
   */
  decrypt(ciphertext: string | null | undefined): string | null {
    if (ciphertext === null || ciphertext === undefined) return null;
    if (ciphertext === '') return '';
    if (!ciphertext.startsWith('enc:v1:')) return ciphertext;

    const reject = (): never => {
      // Never return unverified encrypted bytes to a PII caller or UI.
      throw new Error('encrypted value could not be authenticated');
    };
    const parts = ciphertext.split(':');
    // Legacy five-part envelopes have no explicit rnd/det mode.
    const isCurrent = parts.length === 6 && (parts[2] === 'rnd' || parts[2] === 'det');
    const isLegacy = parts.length === 5;
    if (!isCurrent && !isLegacy) return reject();

    const offset = isCurrent ? 1 : 0;
    const ivHex = parts[2 + offset] ?? '';
    const tagHex = parts[3 + offset] ?? '';
    const cipherHex = parts[4 + offset] ?? '';
    if (
      !/^[a-fA-F0-9]{24}$/.test(ivHex) ||
      !/^[a-fA-F0-9]{32}$/.test(tagHex) ||
      !/^(?:[a-fA-F0-9]{2})+$/.test(cipherHex)
    ) return reject();

    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const encrypted = Buffer.from(cipherHex, 'hex');
    for (const key of this.decryptionKeys) {
      try {
        const decipher = createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(tag);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return decrypted.toString('utf8');
      } catch {
        // Only configured rotation keys may decrypt historical ciphertext.
      }
    }
    return reject();
  }
}
