import { describe, expect, it } from 'vitest';
import { GLOSSARY_TERMS } from '@/config/pseo-glossary.config';
import { searchGlossaryTerms } from './search';

describe('global search of published public glossary terms', () => {
  it('links to the actual canonical PER article instead of only the glossary menu', () => {
    const results = searchGlossaryTerms('PER');
    expect(results[0]).toMatchObject({
      href: '/guide/glossary/per',
      slug: 'per',
      termKo: 'PER (주가수익비율)',
    });
    expect(results.every((result) => GLOSSARY_TERMS.some((term) => term.slug === result.slug))).toBe(true);
  });

  it('matches Korean, English, Japanese, and Chinese published names', () => {
    for (const query of ['주가수익비율', 'Price to Earnings Ratio', '株価収益率', '市盈率']) {
      expect(searchGlossaryTerms(query).some((result) => result.href === '/guide/glossary/per')).toBe(true);
    }
  });

  it('matches published explanations without adding private member or admin routes', () => {
    const results = searchGlossaryTerms('주당순이익');
    expect(results.some((result) => result.slug === 'per')).toBe(true);
    expect(results.every((result) => result.href.startsWith('/guide/glossary/'))).toBe(true);
    expect(results.every((result) => !result.href.includes('?'))).toBe(true);
  });

  it('is deterministic, bounded and deduplicated for broad queries', () => {
    const results = searchGlossaryTerms('배당');
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(12);
    expect(new Set(results.map((result) => result.href)).size).toBe(results.length);
    expect(searchGlossaryTerms('배당')).toEqual(results);
  });

  it('returns no content for blank or excessive queries and refuses invalid slugs', () => {
    expect(searchGlossaryTerms('  ')).toEqual([]);
    expect(searchGlossaryTerms('x'.repeat(81))).toEqual([]);
    expect(searchGlossaryTerms('per', [
      { ...GLOSSARY_TERMS[0]!, slug: '../admin' },
      GLOSSARY_TERMS[0]!,
    ])).toEqual([expect.objectContaining({ href: '/guide/glossary/per' })]);
  });
});
