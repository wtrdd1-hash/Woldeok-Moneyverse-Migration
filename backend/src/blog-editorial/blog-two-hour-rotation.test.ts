import { describe, expect, it } from 'vitest';
import {
  evaluateUnattendedAutoPublish,
  eligibleForGoogleAdsOnGeneratedArticle,
  selectTwoHourBlogSlot,
} from './blog-two-hour-rotation';

const valid = {
  languageAndJurisdictionVerified: true,
  originalArticleVerified: true,
  primarySourceClaimsVerified: true,
  duplicateFree: true,
  contentRightsVerified: true,
  technicalExamplesVerified: true,
  containsUnverifiedCurrentFinancialClaims: false,
  containsPersonalizedInvestingOrCreditAdvice: false,
} as const;

describe('two-hour blog slots v1405', () => {
  it('fires exactly 12 times in one 04:00 KST-to-04:00 KST editorial day', () => {
    const start = Date.parse('2026-10-27T04:00:00+09:00');
    const entries = Array.from({ length: 24 }, (_, i) =>
      selectTwoHourBlogSlot(new Date(start + i * 3_600_000)));
    const due = entries.filter((slot) => slot !== null);
    expect(due).toHaveLength(12);
    expect(entries.filter((_, index) => index % 2 !== 0)).toEqual(Array(12).fill(null));
    expect(new Set(due.map((slot) => slot!.periodKey)).size).toBe(12);
    expect(due.map((slot) => slot!.slotIndex)).toEqual(Array.from({ length: 12 }, (_, i) => i));
    expect(new Set(due.map((slot) => slot!.country))).toEqual(
      new Set(['KR', 'US', 'JP', 'CN']),
    );
    expect(new Set(due.map((slot) => slot!.topic))).toEqual(
      new Set(['ECONOMY', 'CODING', 'COMPUTER']),
    );
    expect(new Set(due.map((slot) => slot!.country + ':' + slot!.topic)).size).toBe(12);
    expect(new Set(due.map((slot) => slot!.editorialDay))).toEqual(new Set(['2026-10-27']));
  });

  it('uses stable KST windows and locales across midnight and ignores minutes', () => {
    const midnight = selectTwoHourBlogSlot(new Date('2026-10-28T00:30:00+09:00'));
    const two = selectTwoHourBlogSlot(new Date('2026-10-28T02:59:00+09:00'));
    expect(midnight).toMatchObject({ slotIndex: 10, editorialDay: '2026-10-27' });
    expect(two).toMatchObject({ slotIndex: 11, editorialDay: '2026-10-27' });
    expect(midnight?.periodKey).toBe('2026-10-28T00:00+09:00');
    expect(selectTwoHourBlogSlot(new Date('2026-10-28T01:00:00+09:00'))).toBeNull();
    expect(selectTwoHourBlogSlot(new Date('2026-10-28T04:00:00+09:00'))?.slotIndex).toBe(0);
    expect(['ko-KR','en-US','ja-JP','zh-CN']).toContain(two?.locale);
  });

  it('rejects invalid scheduler time rather than assigning a phantom publication slot', () => {
    expect(() => selectTwoHourBlogSlot(new Date('invalid'))).toThrow('INVALID_SCHEDULER_CLOCK');
  });

  it('never requires a user review and never automatically unpublishes an existing article', () => {
    expect(evaluateUnattendedAutoPublish(valid)).toEqual({
      eligible: true,
      requiresHumanPreApproval: false,
      requiresHumanPostReview: false,
      mayAutoUnpublishOnReviewTimeout: false,
      reasons: [],
    });
  });

  it('blocks fabricated claims, duplicated articles and missing independent source evidence', () => {
    const outcome = evaluateUnattendedAutoPublish({
      ...valid,
      duplicateFree: false,
      primarySourceClaimsVerified: false,
      containsUnverifiedCurrentFinancialClaims: true,
    });
    expect(outcome.eligible).toBe(false);
    expect(outcome.reasons).toEqual([
      'SOURCES_NOT_VERIFIED',
      'DUPLICATE_CONTENT',
      'UNVERIFIED_MARKET_OR_LEGAL_CLAIMS',
    ]);
    expect(outcome.requiresHumanPreApproval).toBe(false);
    expect(outcome.requiresHumanPostReview).toBe(false);
    expect(outcome.mayAutoUnpublishOnReviewTimeout).toBe(false);
  });
  it('never treats unattended publication as AdSense manual curation', () => {
    const article = {
      manuallyReviewedOrCurated: false,
      substantiveOriginalContent: true,
      invalidTrafficDetected: false,
    };
    expect(eligibleForGoogleAdsOnGeneratedArticle(article)).toBe(false);
    expect(eligibleForGoogleAdsOnGeneratedArticle({
      ...article,
      manuallyReviewedOrCurated: true,
    })).toBe(true);
    expect(eligibleForGoogleAdsOnGeneratedArticle({
      ...article,
      manuallyReviewedOrCurated: true,
      invalidTrafficDetected: true,
    })).toBe(false);
  });

});
