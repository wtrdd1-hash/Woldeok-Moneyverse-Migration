import { describe, expect, it } from 'vitest';
import { createCountryBlogPost } from './blog-country-editorial';
import { recentWorldwideBlogPosts, nativeBlogLocale, blogUrl } from './blog-seo';

function publishedNative(country: 'KR' | 'US' | 'JP' | 'CN', slug: string, publishedAt: string) {
  return {
    ...createCountryBlogPost('compound'),
    slug, country, status: 'PUBLISHED' as const,
    verificationState: 'UNVERIFIED' as const,
    publishedAt,
  };
}

describe('latest worldwide blog recovery v2110', () => {
  it('shows latest foreign native-language articles in the Korean hub without copying or translating them', () => {
    const jp = publishedNative('JP', '2026-11-12-jp-economy-1-unverified', '2026-11-12T06:09:20+09:00');
    const cn = publishedNative('CN', '2026-11-12-cn-coding-2-unverified', '2026-11-12T08:07:44+09:00');
    const kr = publishedNative('KR', '2026-11-12-kr-coding-3-unverified', '2026-11-12T10:01:00+09:00');
    const posts = recentWorldwideBlogPosts([jp, cn, kr], 'ko');
    expect(posts.map(p => p.slug)).toEqual([cn.slug, jp.slug]);
    expect(nativeBlogLocale(posts[0]!)).toBe('zh');
    expect(blogUrl(posts[0]!.slug, nativeBlogLocale(posts[0]!)!)).toContain('/zh/blog/');
  });

  it('excludes withdrawn, unapproved and legacy entries, de-duplicates slugs and honors limit', () => {
    const cn = publishedNative('CN', '2026-11-12-cn-coding-2-unverified', '2026-11-12T08:07:44+09:00');
    const jp = publishedNative('JP', '2026-11-12-jp-economy-1-unverified', '2026-11-12T06:09:20+09:00');
    const hidden = { ...cn, slug: 'withdrawn-article-123', status: 'WITHDRAWN' as const };
    const unapproved = { ...cn, slug: 'draft-article-123', status: 'DRAFT' as const };
    const legacy = { ...cn, slug: 'old-article-123', verificationState: undefined, status: undefined, isAiGenerated: true };
    expect(recentWorldwideBlogPosts([cn, hidden, unapproved, legacy, jp, cn], 'ko', 1).map(p => p.slug)).toEqual([cn.slug]);
    expect(recentWorldwideBlogPosts([cn, hidden, unapproved, legacy, jp, cn], 'ko').map(p => p.slug)).toEqual([cn.slug, jp.slug]);
  });
});
