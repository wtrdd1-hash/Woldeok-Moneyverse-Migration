import { describe, expect, it } from 'vitest';
import type { EditorialSourceReceipt, FinancialClaim } from './blog-claim-checker';
import type { BlogTopicForReview } from './blog-duplicate-review';
import {
  evaluateCountryEditorialDraft,
  inspectPostPublicationReview,
  type CountryEditorialDraft,
} from './blog-country-publish-policy';

const now = new Date('2026-10-22T00:00:00.000Z');
const localeCountries = [
  ['KR', 'ko-KR', 'ko'],
  ['US', 'en-US', 'en'],
  ['JP', 'ja-JP', 'ja'],
  ['CN', 'zh-CN', 'zh'],
] as const;
const source = (country: 'KR' | 'US' | 'JP' | 'CN'): EditorialSourceReceipt => ({
  id: `${country}-receipt`,
  jurisdiction: country,
  verificationStatus: 'VERIFIED',
  observedAt: '2026-10-21T13:00:00.000Z',
  retrievedAt: '2026-10-21T13:01:00.000Z',
  validUntil: '2026-11-21T13:01:00.000Z',
  contentSha256: 'a'.repeat(64),
  canonicalUrl: 'https://www.example.com/finance',
});
const claim = (country: 'KR' | 'US' | 'JP' | 'CN'): FinancialClaim => ({
  id: `${country}-formula`, kind: 'FORMULA', jurisdiction: country,
  number: '72', unit: 'years', citedSourceIds: [`${country}-receipt`],
});
const draft = (country: 'KR' | 'US' | 'JP' | 'CN', locale: CountryEditorialDraft['locale']): CountryEditorialDraft => ({
  id: `${country}-draft`, locale, jurisdiction: country,
  slug: `${country.toLowerCase()}-saving-education`,
  title: `Original ${country} compounding savings educational article`,
  content: `An original ${country} explanation with independently reviewed formula examples and sources.`,
  subject: 'FOUNDATIONAL_MATH',
  officialSourceIngestVerified: true,
  nativeQualityGatePassed: true,
  sourceReceipts: [source(country)],
  numericClaims: [claim(country)],
});

describe('v1108 country-first publish risk classification (advisory; no publication permission)', () => {
  it.each(localeCountries)('accepts low-risk original native candidates for %s/%s', (country, locale) => {
    expect(evaluateCountryEditorialDraft(draft(country, locale), [], now)).toMatchObject({
      status: 'GREEN_CANDIDATE', country, locale, publicationAuthorized: false,
    });
  });
  it('never treats another country source, or an invalid country locale, as GREEN', () => {
    const jp = draft('JP', 'ja-JP');
    const crossSource = { ...jp, sourceReceipts: [source('KR')] };
    expect(evaluateCountryEditorialDraft(crossSource, [], now).status).toBe('BLOCKED');
    const wrongLanguage = draft('JP', 'ko-KR');
    expect(evaluateCountryEditorialDraft(wrongLanguage, [], now).status).toBe('BLOCKED');
  });
  it.each(['TAX', 'PENSION', 'INVESTMENT', 'CREDIT', 'LIVE_MARKET', 'OTHER'] as const)(
    'requires human preapproval of %s, even with a clean citation', (subject) => {
      expect(evaluateCountryEditorialDraft({ ...draft('US', 'en-US'), subject }, [], now).status)
        .toBe('PRE_REVIEW_REQUIRED');
    },
  );
  it('blocks missing, expired or not-ingested source and simulated guaranteed returns', () => {
    const kr = draft('KR', 'ko-KR');
    const cases: CountryEditorialDraft[] = [
      { ...kr, sourceReceipts: [] },
      { ...kr, officialSourceIngestVerified: false },
      { ...kr, sourceReceipts: [{ ...source('KR'), validUntil: '2026-10-20T00:00:00.000Z' }] },
      { ...kr, numericClaims: [{ ...claim('KR'), guaranteesProfit: true }] },
    ];
    for (const item of cases) expect(evaluateCountryEditorialDraft(item, [], now).status).toBe('BLOCKED');
  });
  it('blocks exact legacy title/slug and refers similar body to a reviewer', () => {
    const kr = draft('KR', 'ko-KR');
    const old: BlogTopicForReview = {
      id: 'legacy', jurisdiction: 'KR', locale: 'ko',
      slug: kr.slug, title: kr.title, content: kr.content,
    };
    expect(evaluateCountryEditorialDraft(kr, [old], now).status).toBe('BLOCKED');
    expect(evaluateCountryEditorialDraft({ ...kr, slug: 'different', title: 'A different savings headline' }, [old], now).status)
      .toBe('PRE_REVIEW_REQUIRED');
  });
  it('does not turn AI-generated provenance or model-provided claims into final publish authorization', () => {
    const result = evaluateCountryEditorialDraft(draft('US', 'en-US'), [], now);
    expect(result).not.toHaveProperty('approvalReceipt');
    expect(result.publicationAuthorized).toBe(false);
  });
});

describe('v1108 owner directive: overdue reviews never automatically unpublish', () => {
  it.each([24, 48, 24 * 30])('leaves a published post visible after %i hours; alert only', (hours) => {
    const item = inspectPostPublicationReview({
      publishedAt: '2026-10-01T00:00:00.000Z',
      reviewCompletedAt: null,
      withdrawnAt: null,
    }, new Date(Date.parse('2026-10-01T00:00:00.000Z') + hours * 60 * 60 * 1000));
    expect(item).toEqual({ state: 'OVERDUE', isPublic: true, action: 'ALERT_REVIEWER' });
    expect(item).not.toHaveProperty('autoWithdraw');
  });
  it('shows pending review before 24 hours and reviewed item after human review', () => {
    const publishedAt = '2026-10-21T13:00:00.000Z';
    expect(inspectPostPublicationReview({ publishedAt, reviewCompletedAt: null, withdrawnAt: null }, now))
      .toEqual({ state: 'PENDING', isPublic: true, action: 'KEEP_PUBLIC' });
    expect(inspectPostPublicationReview({ publishedAt, reviewCompletedAt: '2026-10-21T14:00:00.000Z', withdrawnAt: null }, now))
      .toEqual({ state: 'REVIEWED', isPublic: true, action: 'KEEP_PUBLIC' });
  });
  it('only recognizes preexisting human-recorded withdrawal, without creating it', () => {
    const result = inspectPostPublicationReview({
      publishedAt: '2026-10-01T00:00:00.000Z', reviewCompletedAt: null,
      withdrawnAt: '2026-10-03T00:00:00.000Z',
    }, now);
    expect(result).toEqual({ state: 'WITHDRAWN', isPublic: false, action: 'KEEP_WITHDRAWN' });
  });
  it('alerts on malformed timestamps but never hides content merely for a clock parse failure', () => {
    expect(inspectPostPublicationReview({ publishedAt: 'unknown', reviewCompletedAt: null, withdrawnAt: null }, now))
      .toEqual({ state: 'INVALID_TIME', isPublic: true, action: 'ALERT_REVIEWER' });
  });
});
