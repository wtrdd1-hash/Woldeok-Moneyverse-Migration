import { describe, expect, it } from 'vitest';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  const service = new EncryptionService();

  it('encrypts and decrypts randomized text seamlessly', () => {
    const plain = 'user@example.com (월덕 1234)';
    const encrypted = service.encrypt(plain);

    expect(encrypted).toBeDefined();
    expect(encrypted?.startsWith('enc:v1:rnd:')).toBe(true);
    expect(encrypted).not.toContain(plain);

    const decrypted = service.decrypt(encrypted);
    expect(decrypted).toBe(plain);
  });

  it('provides stable deterministic ciphertext for same OAuth subject', () => {
    const subject = '889085646768078850';
    const enc1 = service.encryptDeterministic(subject);
    const enc2 = service.encryptDeterministic(subject);

    expect(enc1).toBe(enc2);
    expect(enc1?.startsWith('enc:v1:det:')).toBe(true);
    expect(service.decrypt(enc1)).toBe(subject);
  });

  it('handles null, undefined, empty string gracefully', () => {
    expect(service.encrypt(null)).toBeNull();
    expect(service.encrypt(undefined)).toBeNull();
    expect(service.encrypt('')).toBe('');

    expect(service.decrypt(null)).toBeNull();
    expect(service.decrypt(undefined)).toBeNull();
    expect(service.decrypt('')).toBe('');
  });

  it('returns plaintext if not encrypted with enc:v1:', () => {
    const raw = 'legacy-unencrypted-string';
    expect(service.decrypt(raw)).toBe(raw);
  });
});
