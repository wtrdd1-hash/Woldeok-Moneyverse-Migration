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
    if (plaintext.startsWith('enc:v1:')) return plaintext;

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
   * Randomized AES-256-GCM encryption for general PII (display names, emails, profiles).
   * Result format: enc:v1:rnd:<iv_hex>:<tag_hex>:<ciphertext_hex>
   */
  encrypt(plaintext: string | null | undefined): string | null {
    if (plaintext === null || plaintext === undefined) return null;
    if (plaintext === '') return '';
    if (plaintext.startsWith('enc:v1:')) return plaintext;

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

    try {
      const parts = ciphertext.split(':');
      // format: enc:v1:type:iv:tag:cipher (6 parts) or enc:v1:iv:tag:cipher (5 parts legacy)
      let ivHex: string;
      let tagHex: string;
      let cipherHex: string;

      if (parts.length === 6 && parts[0] === 'enc' && parts[1] === 'v1') {
        ivHex = parts[3] ?? '';
        tagHex = parts[4] ?? '';
        cipherHex = parts[5] ?? '';
      } else if (parts.length === 5 && parts[0] === 'enc' && parts[1] === 'v1') {
        ivHex = parts[2] ?? '';
        tagHex = parts[3] ?? '';
        cipherHex = parts[4] ?? '';
      } else {
        return ciphertext;
      }

      if (!ivHex || !tagHex || !cipherHex) {
        return ciphertext;
      }

      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');
      const encrypted = Buffer.from(cipherHex, 'hex');

      if (iv.length !== 12 || tag.length !== 16) {
        return ciphertext;
      }

      for (const key of this.decryptionKeys) {
        try {
          const decipher = createDecipheriv('aes-256-gcm', key, iv);
          decipher.setAuthTag(tag);
          const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
          return decrypted.toString('utf8');
        } catch {
          // Historical deployments implicitly used another application secret.
        }
      }
      return ciphertext;
    } catch {
      return ciphertext;
    }
  }
}
