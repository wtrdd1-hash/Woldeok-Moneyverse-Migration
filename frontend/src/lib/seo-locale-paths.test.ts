import { describe, expect, it } from 'vitest';
import { normalizeDoubleLocalePath } from './seo-locale-paths';
import { getVerifiedLocalePaths } from './seo-locale-alternates';

describe('SEO locale canonical and verified translations (v990)', () => {
  it('normalizes historic nested locale prefixes to one explicit language', () => {
    expect(normalizeDoubleLocalePath('/ja/en/guide/glossary/ex-dividend-date')).toBe('/en/guide/glossary/ex-dividend-date');
    expect(normalizeDoubleLocalePath('/en/ja/guide/glossary/cagr')).toBe('/ja/guide/glossary/cagr');
    expect(normalizeDoubleLocalePath('/en/en/guide/glossary')).toBe('/en/guide/glossary');
    expect(normalizeDoubleLocalePath('/ja/en/zh/guide/glossary')).toBe('/zh/guide/glossary');
  });

  it('preserves normal routes and never touches unrelated paths', () => {
    expect(normalizeDoubleLocalePath('/ja/guide/glossary/cagr')).toBeNull();
    expect(normalizeDoubleLocalePath('/ja/tools/loan-interest-calculator')).toBeNull();
    expect(normalizeDoubleLocalePath('/api/v1/users')).toBeNull();
    expect(normalizeDoubleLocalePath('/en/help/ja')).toBeNull();
  });

  it('indexes only real reciprocal loan calculator translations', () => {
    expect(getVerifiedLocalePaths('/tools/loan-interest-calculator')).toEqual({
      ko: '/tools/loan-interest-calculator',
      en: '/en/tools/loan-interest-calculator',
      ja: '/ja/tools/loan-interest-calculator',
      zh: '/zh/tools/loan-interest-calculator',
    });
    expect(getVerifiedLocalePaths('/ja/tools/loan-interest-calculator')?.ja)
      .toBe('/ja/tools/loan-interest-calculator');
    expect(getVerifiedLocalePaths('/ja/tools/salary-calculator')).toBeNull();
  });
});
