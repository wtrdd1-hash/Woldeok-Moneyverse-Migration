import {
  assessFinancialClaims,
  type EditorialJurisdiction,
  type EditorialSourceReceipt,
  type FinancialClaim,
} from './blog-claim-checker';
import {
  reviewBlogDuplicateCandidates,
  type BlogTopicForReview,
} from './blog-duplicate-review';

/**
 * Country-specific deterministic draft *candidate* review, NOT a publication
 * grant. Inputs must originate from the future persisted, verified ingestion
 * service, never raw model JSON or a browser. Publisher must independently
 * revalidate official-source allowlists, revision and DB-signed receipts.
 */
export type CountryLocale = 'ko-KR' | 'en-US' | 'ja-JP' | 'zh-CN';
export type BlogSubject =
  | 'FOUNDATIONAL_MATH' | 'SAVINGS_LITERACY'
  | 'TAX' | 'PENSION' | 'INVESTMENT' | 'CREDIT' | 'LIVE_MARKET' | 'OTHER';
export interface CountryEditorialDraft {
  readonly id: string;
  readonly locale: CountryLocale;
  readonly jurisdiction: EditorialJurisdiction;
  readonly slug: string;
  readonly title: string;
  readonly content: string;
  readonly subject: BlogSubject;
  readonly officialSourceIngestVerified: boolean;
  readonly nativeQualityGatePassed: boolean;
  readonly sourceReceipts: readonly EditorialSourceReceipt[];
  readonly numericClaims: readonly FinancialClaim[];
}
export type CountryDraftStatus = 'GREEN_CANDIDATE' | 'PRE_REVIEW_REQUIRED' | 'BLOCKED';
export interface CountryDraftEvaluation {
  readonly status: CountryDraftStatus;
  readonly country: EditorialJurisdiction;
  readonly locale: CountryLocale;
  readonly reasons: readonly string[];
  /** Deliberately false: no model-side/self-scored decision grants publisher authority. */
  readonly publicationAuthorized: false;
}

const LANG_BY_COUNTRY: Record<EditorialJurisdiction, CountryLocale> = {
  KR: 'ko-KR', US: 'en-US', JP: 'ja-JP', CN: 'zh-CN',
};
const SHORT_LOCALE: Record<CountryLocale, BlogTopicForReview['locale']> = {
  'ko-KR': 'ko', 'en-US': 'en', 'ja-JP': 'ja', 'zh-CN': 'zh',
};
const LOW_RISK: readonly BlogSubject[] = ['FOUNDATIONAL_MATH', 'SAVINGS_LITERACY'];

export function evaluateCountryEditorialDraft(
  draft: CountryEditorialDraft,
  priorArticles: readonly BlogTopicForReview[],
  now: Date = new Date(),
): CountryDraftEvaluation {
  const blocked: string[] = [];
  const needsReview: string[] = [];
  if (LANG_BY_COUNTRY[draft.jurisdiction] !== draft.locale) blocked.push('COUNTRY_LOCALE_MISMATCH');
  if (draft.slug.trim().length < 3 || draft.title.trim().length < 10 || draft.content.trim().length < 40) {
    blocked.push('CONTENT_INCOMPLETE');
  }
  if (!draft.officialSourceIngestVerified) blocked.push('OFFICIAL_SOURCE_NOT_INGESTED');
  if (!draft.sourceReceipts.length || !draft.numericClaims.length) blocked.push('SOURCE_OR_CLAIMS_MISSING');
  if (draft.numericClaims.some((claim) => claim.jurisdiction !== draft.jurisdiction)) {
    blocked.push('CLAIM_COUNTRY_MISMATCH');
  }
  const claimReview = assessFinancialClaims(draft.numericClaims, draft.sourceReceipts, now);
  if (!claimReview.passed) blocked.push(...claimReview.issues.map((issue) => issue.code));
  // Even if a claim checker accepts a valid regulation/date, it is high-impact
  // and still needs a human reviewer before publishing.
  if (draft.numericClaims.some((claim) => claim.kind !== 'FORMULA')) needsReview.push('NON_FORMULA_CLAIM');
  if (!LOW_RISK.includes(draft.subject)) needsReview.push('SENSITIVE_OR_UNCLASSIFIED_TOPIC');
  if (!draft.nativeQualityGatePassed) needsReview.push('NATIVE_ORIGINALITY_UNCONFIRMED');

  const topic: BlogTopicForReview = {
    id: draft.id,
    locale: SHORT_LOCALE[draft.locale],
    jurisdiction: draft.jurisdiction,
    slug: draft.slug,
    title: draft.title,
    content: draft.content,
  };
  const duplicates = reviewBlogDuplicateCandidates(topic, priorArticles);
  if (duplicates.status === 'BLOCK_EXACT') blocked.push('EXACT_DUPLICATE');
  if (duplicates.status === 'REVIEW_SIMILAR') needsReview.push('SIMILAR_CONTENT_REVIEW');

  return {
    status: blocked.length ? 'BLOCKED' : needsReview.length ? 'PRE_REVIEW_REQUIRED' : 'GREEN_CANDIDATE',
    country: draft.jurisdiction, locale: draft.locale,
    reasons: [...new Set([...blocked, ...needsReview])],
    publicationAuthorized: false,
  };
}

/**
 * Review SLA is alert-only. There is *no automatic unpublish* action here.
 * Public visibility may be changed only by a separately authorized manual
 * withdraw/rectification receipt or a distinct legal/security takedown order.
 */
export interface PublishedReviewSnapshot {
  readonly publishedAt: string;
  readonly reviewCompletedAt: string | null;
  readonly withdrawnAt: string | null;
}
export interface PostPublicationReviewStatus {
  readonly state: 'PENDING' | 'OVERDUE' | 'REVIEWED' | 'WITHDRAWN' | 'INVALID_TIME';
  readonly isPublic: boolean;
  readonly action: 'KEEP_PUBLIC' | 'ALERT_REVIEWER' | 'KEEP_WITHDRAWN';
}
const REVIEW_TARGET_MS = 24 * 60 * 60 * 1000;
function parsedTimestamp(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

export function inspectPostPublicationReview(
  snapshot: PublishedReviewSnapshot,
  now: Date = new Date(),
): PostPublicationReviewStatus {
  if (snapshot.withdrawnAt !== null) {
    return { state: 'WITHDRAWN', isPublic: false, action: 'KEEP_WITHDRAWN' };
  }
  const publishedAt = parsedTimestamp(snapshot.publishedAt);
  const nowMs = now.getTime();
  if (publishedAt === null || !Number.isFinite(nowMs) || publishedAt > nowMs) {
    return { state: 'INVALID_TIME', isPublic: true, action: 'ALERT_REVIEWER' };
  }
  if (snapshot.reviewCompletedAt !== null) {
    const reviewedAt = parsedTimestamp(snapshot.reviewCompletedAt);
    if (reviewedAt === null || reviewedAt < publishedAt || reviewedAt > nowMs) {
      return { state: 'INVALID_TIME', isPublic: true, action: 'ALERT_REVIEWER' };
    }
    return { state: 'REVIEWED', isPublic: true, action: 'KEEP_PUBLIC' };
  }
  if (nowMs - publishedAt >= REVIEW_TARGET_MS) {
    return { state: 'OVERDUE', isPublic: true, action: 'ALERT_REVIEWER' };
  }
  return { state: 'PENDING', isPublic: true, action: 'KEEP_PUBLIC' };
}
