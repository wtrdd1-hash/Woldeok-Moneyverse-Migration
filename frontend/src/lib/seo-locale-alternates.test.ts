import { describe, expect, it } from 'vitest';
import {
  getVerifiedLocalePaths,
  getLocalizedCompoundRedirect,
} from './seo-locale-alternates';

describe('verified SEO locale versions (v920)', () => {
  it('only asserts a localized equivalent when actual content is reviewed', () => {
    expect(getVerifiedLocalePaths('/tools/stock-calculator/chips-minus-20')).toBeNull();
    expect(getVerifiedLocalePaths('/tools/compound-calculator/10m-3y-5p')).toBeNull();
    expect(getVerifiedLocalePaths('/tools/loan-interest-calculator')).toBeNull();
    expect(getVerifiedLocalePaths('/stocks/CHIPS')).toBeNull();
    expect(getVerifiedLocalePaths('/en/en/tools/compound-interest-calculator')).toBeNull();
  });

  it('maps Korean compound calculator to real translated pages instead of Korean rewrites', () => {
    expect(getVerifiedLocalePaths('/tools/compound-calculator')).toEqual({
      ko: '/tools/compound-calculator',
      en: '/en/tools/compound-interest-calculator',
      ja: '/ja/tools/compound-interest-calculator',
      zh: '/zh/tools/compound-interest-calculator',
    });
    expect(getVerifiedLocalePaths('/tools/compound-calculator/')).toEqual(
      getVerifiedLocalePaths('/tools/compound-calculator'),
    );
  });

  it('allows verified home, tools and physical localized glossary pages', () => {
    expect(getVerifiedLocalePaths('/')).toEqual({
      ko: '/', en: '/en', ja: '/ja', zh: '/zh',
    });
    expect(getVerifiedLocalePaths('/tools')?.ja).toBe('/ja/tools');
    expect(getVerifiedLocalePaths('/guide/glossary/per')?.en)
      .toBe('/en/guide/glossary/per');
    expect(getVerifiedLocalePaths('/guide/glossary')?.zh).toBe('/zh/guide/glossary');
  });

  it('moves only legacy compound home aliases to actual locale-specific calculator', () => {
    expect(getLocalizedCompoundRedirect('/en/tools/compound-calculator'))
      .toBe('/en/tools/compound-interest-calculator');
    expect(getLocalizedCompoundRedirect('/ja/tools/compound-calculator/'))
      .toBe('/ja/tools/compound-interest-calculator');
    expect(getLocalizedCompoundRedirect('/zh/tools/compound-calculator'))
      .toBe('/zh/tools/compound-interest-calculator');
    expect(getLocalizedCompoundRedirect('/ko/tools/compound-calculator')).toBeNull();
    expect(getLocalizedCompoundRedirect('/en/tools/compound-calculator/10m-3y-5p')).toBeNull();
    expect(getLocalizedCompoundRedirect('/en/tools/compound-interest-calculator')).toBeNull();
    expect(getLocalizedCompoundRedirect('/en/tools')).toBeNull();
  });
});
