/**
 * Candidate-only duplicate screen for draft topics.
 * It cannot approve a document or assert Google originality.
 * Calibrate thresholds against the 171-post historic corpus before production.
 */
export interface BlogTopicForReview {
  readonly id: string;
  readonly locale: 'ko' | 'en' | 'ja' | 'zh';
  readonly jurisdiction: 'KR' | 'US' | 'JP' | 'CN';
  readonly slug: string;
  readonly title: string;
  readonly content: string;
}
export interface DuplicateMatch {
  readonly id: string;
  readonly reason: 'SLUG' | 'EXACT_TITLE' | 'SIMILAR_BODY';
  readonly similarity: number;
}
export type DuplicateScreenStatus = 'BLOCK_EXACT' | 'REVIEW_SIMILAR' | 'CLEAR_FOR_EDITORIAL_REVIEW';
export interface DuplicateScreenResult {
  readonly status: DuplicateScreenStatus;
  readonly matches: readonly DuplicateMatch[];
}

function normalized(text: string): string {
  return text.normalize('NFKC').toLocaleLowerCase('en-US')
    .replace(/[\p{P}\p{S}\s]/gu, '');
}
function trigrams(text: string): Set<string> {
  const chars = normalized(text).slice(0, 50_000);
  if (chars.length < 3) return new Set(chars ? [chars] : []);
  const result = new Set<string>();
  for (let i = 0; i <= chars.length - 3; i++) {
    result.add(chars.slice(i, i + 3));
  }
  return result;
}
function jaccard(left: Set<string>, right: Set<string>): number {
  if (!left.size || !right.size) return 0;
  let intersection = 0;
  for (const token of left) if (right.has(token)) intersection++;
  return intersection / (left.size + right.size - intersection);
}

export function reviewBlogDuplicateCandidates(
  candidate: BlogTopicForReview,
  existing: readonly BlogTopicForReview[],
): DuplicateScreenResult {
  const title = normalized(candidate.title);
  const body = trigrams(candidate.content);
  const matches: DuplicateMatch[] = [];

  for (const post of existing) {
    if (post.id === candidate.id || post.locale !== candidate.locale
      || post.jurisdiction !== candidate.jurisdiction) continue;
    if (post.slug === candidate.slug) {
      matches.push({ id: post.id, reason: 'SLUG', similarity: 1 });
      continue;
    }
    if (title && title === normalized(post.title)) {
      matches.push({ id: post.id, reason: 'EXACT_TITLE', similarity: 1 });
      continue;
    }
    // A draft with the same body but a different title is *reviewed*, not
    // automatically rejected: legal/source/jurisdiction differences may matter.
    const similarity = jaccard(body, trigrams(post.content));
    if (similarity >= 0.82) {
      matches.push({ id: post.id, reason: 'SIMILAR_BODY', similarity });
    }
  }

  return {
    status: matches.some((x) => x.reason === 'SLUG' || x.reason === 'EXACT_TITLE')
      ? 'BLOCK_EXACT'
      : matches.length ? 'REVIEW_SIMILAR' : 'CLEAR_FOR_EDITORIAL_REVIEW',
    matches,
  };
}
