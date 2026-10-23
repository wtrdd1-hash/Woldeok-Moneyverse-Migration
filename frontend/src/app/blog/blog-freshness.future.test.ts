import { describe, expect, it } from 'vitest';
import { getBlogFreshnessNotice } from './blog-freshness';

describe('blog freshness timestamp safety', () => {
  const old = [{ publishedAt: '2026-10-15T00:00:00Z' }];
  const now = new Date('2026-10-20T00:00:00Z');
  it('ignores future publications masking stale posts', () => {
    expect(getBlogFreshnessNotice([...old, { publishedAt: '2026-11-01T00:00:00Z' }], 'en', now)).toContain('2026-10-15');
  });
  it('does not report future-only publications as stale', () => {
    expect(getBlogFreshnessNotice([{ publishedAt: '2026-11-01T00:00:00Z' }], 'en', now)).toBeNull();
  });
  it('preserves the 48-hour inclusive freshness boundary', () => {
    const published = [{ publishedAt: '2026-10-18T00:00:00.000Z' }];
    expect(getBlogFreshnessNotice(published, 'ko', now)).toBeNull();
    expect(getBlogFreshnessNotice(published, 'ko', new Date(now.getTime() + 1))).toContain('2026-10-18');
  });
  it('ignores invalid publication dates and preserves four localized notices', () => {
    const posts = [...old, { publishedAt: 'not-a-date' }, { publishedAt: '2026-11-01T00:00:00Z' }];
    for (const locale of ['ko', 'en', 'ja', 'zh'] as const) {
      expect(getBlogFreshnessNotice(posts, locale, now)).toContain('2026-10-15');
    }
  });
  it('rejects an invalid reference clock', () => {
    expect(getBlogFreshnessNotice(old, 'en', new Date('invalid'))).toBeNull();
  });
});
