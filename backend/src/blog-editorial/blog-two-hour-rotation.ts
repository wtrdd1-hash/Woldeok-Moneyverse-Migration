/**
 * Product schedule v1405 — this is a schedule and immutable content-intent
 * contract. It is NOT a publishing permit or a language generator.
 *
 * Asia/Seoul has a constant +09:00 offset (no daylight-saving transitions).
 * The editorial day begins at 04:00 KST; a two-hour window is due every even
 * hour, including 00:00 and 02:00 as the previous editorial day's last slots.
 */
export type BlogRotationCountry = 'KR' | 'US' | 'JP' | 'CN';
export type BlogRotationLocale = 'ko-KR' | 'en-US' | 'ja-JP' | 'zh-CN';
export type BlogRotationTopic = 'ECONOMY' | 'CODING' | 'COMPUTER';

export interface BlogRotationSlot {
  readonly periodKey: string;
  readonly editorialDay: string;
  readonly slotIndex: number;
  readonly country: BlogRotationCountry;
  readonly locale: BlogRotationLocale;
  readonly topic: BlogRotationTopic;
  /** Economy uses an evergreen explainer, not unverified current market rates. */
  readonly contentIntent: 'FOUNDATIONAL_ECONOMICS' | 'PROGRAMMING' | 'COMPUTER_SYSTEMS';
}

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;
const SEOUL_OFFSET_MS = 9 * HOUR_MS;
const COUNTRIES = [
  { country: 'KR', locale: 'ko-KR' },
  { country: 'US', locale: 'en-US' },
  { country: 'JP', locale: 'ja-JP' },
  { country: 'CN', locale: 'zh-CN' },
] as const;
const TOPICS: readonly BlogRotationTopic[] = ['ECONOMY', 'CODING', 'COMPUTER'];

function dayString(epochMs: number): string {
  return new Date(epochMs).toISOString().slice(0, 10);
}

/** Returns null between scheduled windows; never silently publish on odd hours. */
export function selectTwoHourBlogSlot(now: Date): BlogRotationSlot | null {
  if (!Number.isFinite(now.getTime())) throw new Error('INVALID_SCHEDULER_CLOCK');

  // Convert to an ordinary UTC calendar view of Korean local wall time.
  const koreanTime = new Date(now.getTime() + SEOUL_OFFSET_MS);
  const currentHour = koreanTime.getUTCHours();
  if (currentHour % 2 !== 0) return null;

  const localMidnight = Date.UTC(
    koreanTime.getUTCFullYear(),
    koreanTime.getUTCMonth(),
    koreanTime.getUTCDate(),
  );
  const editorialMidnight = currentHour < 4 ? localMidnight - DAY_MS : localMidnight;
  const editorialDay = dayString(editorialMidnight);
  const dayIndex = Math.floor(editorialMidnight / DAY_MS);
  const slotIndex = ((currentHour - 4 + 24) % 24) / 2;
  const country = COUNTRIES[(slotIndex + dayIndex) % COUNTRIES.length]!;
  const topic = TOPICS[(slotIndex + Math.floor(dayIndex / 4)) % TOPICS.length]!;
  const periodKey = dayString(localMidnight) + 'T' + String(currentHour).padStart(2, '0') + ':00+09:00';

  return {
    periodKey,
    editorialDay,
    slotIndex,
    country: country.country,
    locale: country.locale,
    topic,
    contentIntent: topic === 'ECONOMY'
      ? 'FOUNDATIONAL_ECONOMICS'
      : topic === 'CODING' ? 'PROGRAMMING' : 'COMPUTER_SYSTEMS',
  };
}

/**
 * A user doesn't need to approve drafts before or after publication.
 * The *independent automated verifier* is mandatory; failing material can
 * be regenerated later, but not published as an unsupported "fact".
 * This function is advisory only: it cannot authorize a DB write or disable
 * the legacy publish hold without an auditable publication receipt.
 */
export interface VerifiedAutoPublishEvidence {
  readonly languageAndJurisdictionVerified: boolean;
  readonly originalArticleVerified: boolean;
  readonly primarySourceClaimsVerified: boolean;
  readonly duplicateFree: boolean;
  readonly contentRightsVerified: boolean;
  readonly technicalExamplesVerified: boolean;
  readonly containsUnverifiedCurrentFinancialClaims: boolean;
  readonly containsPersonalizedInvestingOrCreditAdvice: boolean;
}

export function evaluateUnattendedAutoPublish(evidence: VerifiedAutoPublishEvidence): {
  readonly eligible: boolean;
  readonly requiresHumanPreApproval: false;
  readonly requiresHumanPostReview: false;
  readonly mayAutoUnpublishOnReviewTimeout: false;
  readonly reasons: readonly string[];
} {
  const reasons: string[] = [];
  if (!evidence.languageAndJurisdictionVerified) reasons.push('LOCALE_NOT_VERIFIED');
  if (!evidence.originalArticleVerified) reasons.push('ORIGINALITY_NOT_VERIFIED');
  if (!evidence.primarySourceClaimsVerified) reasons.push('SOURCES_NOT_VERIFIED');
  if (!evidence.duplicateFree) reasons.push('DUPLICATE_CONTENT');
  if (!evidence.contentRightsVerified) reasons.push('RIGHTS_NOT_VERIFIED');
  if (!evidence.technicalExamplesVerified) reasons.push('EXAMPLES_NOT_VERIFIED');
  if (evidence.containsUnverifiedCurrentFinancialClaims) reasons.push('UNVERIFIED_MARKET_OR_LEGAL_CLAIMS');
  if (evidence.containsPersonalizedInvestingOrCreditAdvice) reasons.push('PERSONALIZED_FINANCIAL_ADVICE');

  return {
    eligible: reasons.length === 0,
    requiresHumanPreApproval: false,
    requiresHumanPostReview: false,
    mayAutoUnpublishOnReviewTimeout: false,
    reasons,
  };
}


/**
 * Google-served ad inventory is stricter than public visibility. Google
 * Publisher Policies explicitly disallow Google-served ads on automatically
 * generated pages without manual review or curation. This is separate from
 * the owner's choice to allow unattended *publication*.
 */
export function eligibleForGoogleAdsOnGeneratedArticle(input: {
  readonly manuallyReviewedOrCurated: boolean;
  readonly substantiveOriginalContent: boolean;
  readonly invalidTrafficDetected: boolean;
}): boolean {
  return input.manuallyReviewedOrCurated
    && input.substantiveOriginalContent
    && !input.invalidTrafficDetected;
}
