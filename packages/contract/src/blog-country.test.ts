import { describe, expect, it } from 'vitest';
import {
  BLOG_COUNTRY_LOCALES,
  checkCountryArticleIntent,
  type BlogCountry,
  type CountryArticleIntent,
} from './blog-country';

const currencies = { KR: 'KRW', US: 'USD', JP: 'JPY', CN: 'CNY' } as const;
function intent(country: BlogCountry): CountryArticleIntent {
  return {
    country,
    locale: BLOG_COUNTRY_LOCALES[country],
    audienceJurisdiction: country,
    intentCluster: 'savings-foundations',
    nativeTitle: 'Original local savings education guide',
    currency: currencies[country],
    policyYear: 2026,
    calculatorContract: null,
  };
}

describe('v1143 four-market country intent metadata validation', () => {
  it.each(['KR', 'US', 'JP', 'CN'] as const)(
    'accepts correctly scoped native intent for %s (not publication authorization)',
    (country) => {
      expect(checkCountryArticleIntent(intent(country))).toEqual({ valid: true, reasons: [] });
    },
  );
  it('rejects cross-country language, audience jurisdiction and currency', () => {
    const mismatched = {
      ...intent('JP'),
      locale: 'en-US',
      audienceJurisdiction: 'US',
      currency: 'USD',
    } as CountryArticleIntent;
    expect(checkCountryArticleIntent(mismatched)).toEqual({
      valid: false,
      reasons: ['COUNTRY_LOCALE_MISMATCH', 'AUDIENCE_COUNTRY_MISMATCH', 'COUNTRY_CURRENCY_MISMATCH'],
    });
  });
  it('rejects missing or unsafe editorial identifiers and dates', () => {
    const invalid = {
      ...intent('KR'),
      intentCluster: '../',
      nativeTitle: '   ',
      policyYear: 2026.5,
      calculatorContract: '../withdraw',
    };
    expect(checkCountryArticleIntent(invalid).reasons).toEqual([
      'INVALID_INTENT_CLUSTER', 'INVALID_NATIVE_TITLE',
      'INVALID_POLICY_YEAR', 'INVALID_CALCULATOR_CONTRACT',
    ]);
  });
  it('does not return a publication token or assert server approval', () => {
    const result = checkCountryArticleIntent(intent('US'));
    expect(result).not.toHaveProperty('publicationAuthorized');
    expect(result).not.toHaveProperty('publicationReceipt');
  });
});
