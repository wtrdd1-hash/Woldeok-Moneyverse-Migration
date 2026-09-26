import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  CORPUS_DOMAINS,
  CORPUS_METADATA,
  CORE_DOMAIN_TERMS,
  lookupCoreTerm,
} from './references/corpus-lookup';

describe('150k+ Multilingual Domain Reference Corpus', () => {
  it('has exact 150,000 declared entry capacity and 9 core domains', () => {
    expect(CORPUS_METADATA.totalEntries).toBe(150000);
    expect(CORPUS_METADATA.domains.length).toBe(9);
    expect(CORPUS_DOMAINS).toContain('fintech');
    expect(CORPUS_DOMAINS).toContain('stocks');
    expect(CORPUS_DOMAINS).toContain('central_bank');
    expect(CORPUS_DOMAINS).toContain('casino');
    expect(CORPUS_DOMAINS).toContain('jobs');
    expect(CORPUS_DOMAINS).toContain('seasons');
    expect(CORPUS_DOMAINS).toContain('city_projects');
    expect(CORPUS_DOMAINS).toContain('community');
    expect(CORPUS_DOMAINS).toContain('security_compliance');
  });

  it('guarantees complete 4-language coverage for all resident core terms', () => {
    const keys = Object.keys(CORE_DOMAIN_TERMS);
    expect(keys.length).toBeGreaterThanOrEqual(25);

    for (const key of keys) {
      const entry = CORE_DOMAIN_TERMS[key]!;
      expect(entry.ko, `Missing ko for ${key}`).toBeTruthy();
      expect(entry.en, `Missing en for ${key}`).toBeTruthy();
      expect(entry.ja, `Missing ja for ${key}`).toBeTruthy();
      expect(entry.zh, `Missing zh for ${key}`).toBeTruthy();
    }
  });

  it('lookupCoreTerm correctly resolves translation across all locales', () => {
    expect(lookupCoreTerm('fintech.transfer', 'ko')).toBe('즉시 송금');
    expect(lookupCoreTerm('fintech.transfer', 'en')).toBe('Instant Transfer');
    expect(lookupCoreTerm('fintech.transfer', 'ja')).toBe('即時送金');
    expect(lookupCoreTerm('fintech.transfer', 'zh')).toBe('实时转账');
  });

  it('verifies generated corpus-150k.json file existence and structural validity', () => {
    const filePath = path.resolve(__dirname, 'references/corpus-150k.json');
    expect(fs.existsSync(filePath), 'corpus-150k.json must exist').toBe(true);

    const stat = fs.statSync(filePath);
    expect(stat.size).toBeGreaterThan(10 * 1024 * 1024); // > 10MB (actual ~69MB)

    // Read first 2KB to verify header json structure without loading 69MB in test memory
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(2048);
    fs.readSync(fd, buffer, 0, 2048, 0);
    fs.closeSync(fd);

    const headerChunk = buffer.toString('utf-8');
    expect(headerChunk).toContain('"version": "2026.09.26.150k"');
    expect(headerChunk).toContain('"totalEntries": 150000');
    expect(headerChunk).toContain('"domains"');
  });
});
