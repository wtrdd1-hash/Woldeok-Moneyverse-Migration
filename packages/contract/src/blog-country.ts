/**
 * v2026.10.23.1143 — Country-native editorial contracts.
 *
 * Data shapes only. No caller can obtain publication authority by filling
 * these fields: publication requires an independent server-side DB gate.
 */
export const BLOG_COUNTRY_LOCALES = {
  KR: 'ko-KR',
  US: 'en-US',
  JP: 'ja-JP',
  CN: 'zh-CN',
} as const;

export type BlogCountry = keyof typeof BLOG_COUNTRY_LOCALES;
export type BlogLocale = (typeof BLOG_COUNTRY_LOCALES)[BlogCountry];
export type BlogRiskTier = 'GREEN' | 'AMBER' | 'RED';

export interface CountryArticleIntent {
  readonly country: BlogCountry;
  readonly locale: BlogLocale;
  readonly audienceJurisdiction: BlogCountry;
  readonly intentCluster: string;
  readonly nativeTitle: string;
  readonly currency: 'KRW' | 'USD' | 'JPY' | 'CNY';
  readonly policyYear: number;
  readonly calculatorContract: string | null;
}

export interface NativeArticleRevision {
  readonly draftId: string;
  readonly revisionHash: string;
  readonly contentHash: string;
  readonly sourceReceiptIds: readonly string[];
  readonly createdAt: string;
}

export interface EditorialEvidenceReceipt {
  readonly id: string;
  readonly country: BlogCountry;
  readonly canonicalUrl: string;
  readonly contentSha256: string;
  readonly retrievedAt: string;
  readonly effectiveAt: string | null;
  readonly expiresAt: string;
}

export interface PublicationGateReceipt {
  readonly draftId: string;
  readonly revisionHash: string;
  readonly evidenceHash: string;
  readonly riskTier: BlogRiskTier;
  readonly policyVersion: string;
  readonly verifiedByServerAt: string;
}

export interface BlogPublicationReceipt {
  readonly publicationId: string;
  readonly draftId: string;
  readonly revisionHash: string;
  readonly country: BlogCountry;
  readonly locale: BlogLocale;
  readonly publishedAt: string;
  readonly reviewDueAt: string;
}

export interface BlogWithdrawalReceipt {
  readonly publicationId: string;
  readonly revisionHash: string;
  readonly actorId: string;
  readonly decisionId: string;
  readonly reason: string;
  readonly withdrawnAt: string;
}

const EXPECTED_CURRENCIES: Record<BlogCountry, CountryArticleIntent['currency']> = {
  KR: 'KRW', US: 'USD', JP: 'JPY', CN: 'CNY',
};

export type CountryIntentCheck = { readonly valid: boolean; readonly reasons: readonly string[] };

/**
 * A nonauthoritative validator for incoming article-intent metadata.
 * This does NOT validate citations, claims, article text or authenticity.
 */
export function checkCountryArticleIntent(value: CountryArticleIntent): CountryIntentCheck {
  const reasons: string[] = [];
  if (!(value.country in BLOG_COUNTRY_LOCALES)
      || BLOG_COUNTRY_LOCALES[value.country] !== value.locale) {
    reasons.push('COUNTRY_LOCALE_MISMATCH');
  }
  if (value.country !== value.audienceJurisdiction) reasons.push('AUDIENCE_COUNTRY_MISMATCH');
  if (!(value.country in EXPECTED_CURRENCIES)
      || EXPECTED_CURRENCIES[value.country] !== value.currency) {
    reasons.push('COUNTRY_CURRENCY_MISMATCH');
  }
  if (!/^[a-z0-9][a-z0-9_-]{2,79}$/.test(value.intentCluster)) {
    reasons.push('INVALID_INTENT_CLUSTER');
  }
  if (value.nativeTitle.trim().length < 10 || value.nativeTitle.length > 180) {
    reasons.push('INVALID_NATIVE_TITLE');
  }
  if (!Number.isSafeInteger(value.policyYear) || value.policyYear < 2000 || value.policyYear > 2100) {
    reasons.push('INVALID_POLICY_YEAR');
  }
  if (value.calculatorContract !== null
      && !/^[a-z][a-z0-9-]{2,99}$/.test(value.calculatorContract)) {
    reasons.push('INVALID_CALCULATOR_CONTRACT');
  }
  return { valid: reasons.length === 0, reasons };
}
