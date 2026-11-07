/** Fail closed when a successful HTTP response cannot prove the admin queue shape. */
export interface HelpReviewArticle {
  readonly article_id: string;
  readonly locale: 'ko' | 'en';
  readonly slug: string;
  readonly category: 'account' | 'wallet' | 'shop' | 'community' | 'support';
  readonly title: string;
  readonly body_plain: string;
  readonly source_url: string;
  readonly source_sha256: string;
  readonly reviewed_until: string;
  readonly state: 'draft' | 'in_review' | 'published' | 'retracted';
  readonly version: string;
  readonly author_id: string;
  readonly canApprove: boolean;
  readonly canRetract: boolean;
  readonly reviewCurrent: boolean;
}

interface HelpReviewQueue {
  readonly canDraft: boolean;
  readonly articles: readonly HelpReviewArticle[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const SHA256 = /^[a-f0-9]{64}$/;
const VERSION = /^[1-9][0-9]{0,18}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LOCALES = new Set(['ko', 'en']);
const CATEGORIES = new Set(['account', 'wallet', 'shop', 'community', 'support']);
const STATES = new Set(['draft', 'in_review', 'published', 'retracted']);

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function text(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max && value.trim().length > 0;
}

function validSource(value: unknown): value is string {
  if (!text(value, 2000) || /[\s<>"']/.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.length > 0 && url.username === '' && url.password === '';
  } catch { return false; }
}

function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_UTC.test(value)) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}

function article(raw: unknown, now: number): HelpReviewArticle | null {
  if (!object(raw) ||
    typeof raw.article_id !== 'string' || !UUID.test(raw.article_id) ||
    typeof raw.author_id !== 'string' || !UUID.test(raw.author_id) ||
    typeof raw.locale !== 'string' || !LOCALES.has(raw.locale) ||
    !text(raw.slug, 100) || !SLUG.test(raw.slug) ||
    typeof raw.category !== 'string' || !CATEGORIES.has(raw.category) ||
    !text(raw.title, 120) || !text(raw.body_plain, 12000) ||
    !validSource(raw.source_url) ||
    typeof raw.source_sha256 !== 'string' || !SHA256.test(raw.source_sha256) ||
    !validDate(raw.reviewed_until) ||
    typeof raw.state !== 'string' || !STATES.has(raw.state) ||
    typeof raw.version !== 'string' || !VERSION.test(raw.version) ||
    typeof raw.canApprove !== 'boolean' || typeof raw.canRetract !== 'boolean') return null;

  return {
    article_id: raw.article_id, author_id: raw.author_id,
    locale: raw.locale as HelpReviewArticle['locale'],
    slug: raw.slug, category: raw.category as HelpReviewArticle['category'],
    title: raw.title, body_plain: raw.body_plain,
    source_url: raw.source_url, source_sha256: raw.source_sha256,
    reviewed_until: raw.reviewed_until,
    state: raw.state as HelpReviewArticle['state'], version: raw.version,
    canApprove: raw.canApprove, canRetract: raw.canRetract,
    reviewCurrent: Date.parse(raw.reviewed_until) > now,
  };
}

export function parseHelpReviewQueue(raw: unknown, now: number = Date.now()): HelpReviewQueue | null {
  if (!object(raw) || typeof raw.canDraft !== 'boolean' ||
    !Array.isArray(raw.articles) || raw.articles.length > 50) return null;
  const seen = new Set<string>();
  const articles: HelpReviewArticle[] = [];
  for (const item of raw.articles) {
    const parsed = article(item, now);
    if (!parsed || seen.has(parsed.article_id.toLowerCase())) return null;
    seen.add(parsed.article_id.toLowerCase());
    articles.push(parsed);
  }
  return { canDraft: raw.canDraft, articles };
}
