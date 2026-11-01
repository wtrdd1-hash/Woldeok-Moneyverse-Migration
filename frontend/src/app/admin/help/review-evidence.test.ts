import { describe, expect, it } from 'vitest';
import { parseHelpReviewQueue } from './review-evidence';

const draft = {
  article_id: '00000000-0000-4000-8000-000000000001',
  locale: 'ko', slug: 'account-help', category: 'account', title: 'Account help',
  body_plain: 'Verified plain-text article', source_url: 'https://example.org/verified',
  source_sha256: 'a'.repeat(64), reviewed_until: '2026-12-01T00:00:00.000Z',
  state: 'draft', version: '1', author_id: '00000000-0000-4000-8000-000000000002',
  canApprove: true, canRetract: false,
};
const now = Date.parse('2026-11-02T00:00:00Z');

describe('verified help administrator review source', () => {
  it('distinguishes verified empty from unavailable and preserves operator capability', () => {
    expect(parseHelpReviewQueue({ articles: [], canDraft: false }, now)).toEqual({ articles: [], canDraft: false });
    expect(parseHelpReviewQueue(null, now)).toBeNull();
    expect(parseHelpReviewQueue({ articles: [] }, now)).toBeNull();
  });

  it('accepts a database-backed draft with exact version and current evidence', () => {
    expect(parseHelpReviewQueue({ articles: [draft], canDraft: true }, now)).toEqual({
      articles: [{ ...draft, reviewCurrent: true }], canDraft: true,
    });
  });

  it('keeps an expired review visible but not eligible for publication', () => {
    expect(parseHelpReviewQueue({ articles: [{ ...draft, reviewed_until: '2026-11-01T23:59:59.000Z' }], canDraft: false }, now)?.articles[0]?.reviewCurrent).toBe(false);
  });

  it.each([
    { articles: 'not an array', canDraft: true },
    { articles: [null], canDraft: false },
    { articles: [draft], canDraft: 'yes' },
    { articles: [draft, draft], canDraft: false },
    { articles: [{ ...draft, article_id: 'not-a-uuid' }], canDraft: false },
    { articles: [{ ...draft, author_id: 'not-a-uuid' }], canDraft: false },
    { articles: [{ ...draft, version: '1.5' }], canDraft: false },
    { articles: [{ ...draft, version: '0' }], canDraft: false },
    { articles: [{ ...draft, source_sha256: 'bad' }], canDraft: false },
    { articles: [{ ...draft, source_url: 'http://example.org' }], canDraft: false },
    { articles: [{ ...draft, reviewed_until: 'yesterday' }], canDraft: false },
    { articles: [{ ...draft, state: 'approved' }], canDraft: false },
    { articles: [{ ...draft, canApprove: 'yes' }], canDraft: false },
    { articles: [{ ...draft, title: '' }], canDraft: false },
    { articles: [{ ...draft, locale: 'fr' }], canDraft: false },
    { articles: [{ ...draft, body_plain: '' }], canDraft: false },
    { articles: Array.from({ length: 51 }, (_, i) => ({ ...draft, article_id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}` })), canDraft: false },
  ])('rejects incomplete or forged success-shaped queue evidence (%#)', (payload) => {
    expect(parseHelpReviewQueue(payload, now)).toBeNull();
  });
});
