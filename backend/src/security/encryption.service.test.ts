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

  it('rejects malformed encrypted envelopes rather than returning ciphertext', () => {
    for (const malformed of [
      'enc:v1:rnd:not-hex:00:aa',
      'enc:v1:det:abcd:abcd:abcd',
      'enc:v1:other:000000000000000000000000:00000000000000000000000000000000:aa',
      'enc:v1:rnd:000000000000000000000000:00000000000000000000000000000000:aa:extra',
    ]) {
      expect(() => service.decrypt(malformed)).toThrow('encrypted value could not be authenticated');
    }
  });

  it('rejects ciphertext with a modified authentication tag', () => {
    const valid = service.encrypt('private profile data')!;
    const parts = valid.split(':');
    parts[4] = `${parts[4]![0] === 'a' ? 'b' : 'a'}${parts[4]!.slice(1)}`;
    expect(() => service.decrypt(parts.join(':'))).toThrow('encrypted value could not be authenticated');
  });

  it('rejects ciphertext from an unconfigured encryption key', () => {
    const previousKey = process.env.DATA_ENCRYPTION_KEY;
    const previousLegacy = process.env.LEGACY_DATA_ENCRYPTION_KEYS;
    try {
      process.env.DATA_ENCRYPTION_KEY = 'encryption-test-key-one';
      delete process.env.LEGACY_DATA_ENCRYPTION_KEYS;
      const ciphertext = new EncryptionService().encrypt('confidential');
      process.env.DATA_ENCRYPTION_KEY = 'encryption-test-key-two';
      expect(() => new EncryptionService().decrypt(ciphertext)).toThrow('encrypted value could not be authenticated');
    } finally {
      if (previousKey === undefined) delete process.env.DATA_ENCRYPTION_KEY;
      else process.env.DATA_ENCRYPTION_KEY = previousKey;
      if (previousLegacy === undefined) delete process.env.LEGACY_DATA_ENCRYPTION_KEYS;
      else process.env.LEGACY_DATA_ENCRYPTION_KEYS = previousLegacy;
    }
  });

  it('does not accept forged encrypted prefixes as already-authenticated inputs', () => {
    const forged = 'enc:v1:rnd:000000000000000000000000:00000000000000000000000000000000:aa';
    expect(() => service.encrypt(forged)).toThrow('encrypted value could not be authenticated');
    expect(() => service.encryptDeterministic(forged)).toThrow('encrypted value could not be authenticated');
  });

  it('returns plaintext if not encrypted with enc:v1:', () => {
    const raw = 'legacy-unencrypted-string';
    expect(service.decrypt(raw)).toBe(raw);
  });

  it('decrypts values written with a verified legacy key while encrypting with the current key', () => {
    const previousDataKey = process.env.DATA_ENCRYPTION_KEY;
    const previousLegacyKeys = process.env.LEGACY_DATA_ENCRYPTION_KEYS;
    try {
      process.env.DATA_ENCRYPTION_KEY = 'historical-key';
      delete process.env.LEGACY_DATA_ENCRYPTION_KEYS;
      const historical = new EncryptionService().encrypt('기존 닉네임');

      process.env.DATA_ENCRYPTION_KEY = 'current-key';
      process.env.LEGACY_DATA_ENCRYPTION_KEYS = 'historical-key';
      const current = new EncryptionService();

      expect(current.decrypt(historical)).toBe('기존 닉네임');
      expect(current.decrypt(current.encrypt('새 닉네임'))).toBe('새 닉네임');
    } finally {
      if (previousDataKey === undefined) delete process.env.DATA_ENCRYPTION_KEY;
      else process.env.DATA_ENCRYPTION_KEY = previousDataKey;
      if (previousLegacyKeys === undefined) delete process.env.LEGACY_DATA_ENCRYPTION_KEYS;
      else process.env.LEGACY_DATA_ENCRYPTION_KEYS = previousLegacyKeys;
    }
  });
});
