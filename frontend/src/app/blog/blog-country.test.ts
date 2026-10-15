import { describe, expect, it } from 'vitest';
import { createCountryBlogPost, COUNTRY_EDITION_TOPICS } from './blog-country-editorial';
import { blogAlternateLanguages, blogUrl, getBlogCountryEdition, canonicalBlogSlug } from './blog-seo';
import { getAllBlogPosts, getBlogPostBySlug } from './blog-data';
import { summarizeBlogPost } from './blog-page-server';
import { GET as getBlogSitemap } from '../sitemap-blog.xml/route';

const origin = 'https://easy-scraping.com';

describe('country-specific blog and canonical SEO', () => {
  it('provides at least six distinct financial education subjects with four genuinely localized editions', () => {
    expect(COUNTRY_EDITION_TOPICS.length).toBeGreaterThanOrEqual(6);
    expect(new Set(COUNTRY_EDITION_TOPICS)).toHaveProperty('size', COUNTRY_EDITION_TOPICS.length);
    for (const topic of COUNTRY_EDITION_TOPICS) {
      const post = createCountryBlogPost(topic);
      expect(post.title).toContain('한국');
      expect(post.content.length).toBeGreaterThan(450);
      for (const locale of ['en', 'ja', 'zh'] as const) {
        const translation = post.translations?.[locale];
        expect(translation?.title.length).toBeGreaterThan(10);
        expect(translation?.content.length).toBeGreaterThan(360);
        expect(translation?.content).not.toEqual(post.content);
        expect(translation?.content).toContain('http');
      }
      expect(post.heroImage).toBeUndefined();
    }
  });

  it('uses self-canonicals and reciprocal localized alternates only for genuine editions', () => {
    const post = createCountryBlogPost('compound');
    expect(blogUrl(post.slug, 'ko')).toBe(`${origin}/blog/${post.slug}`);
    expect(blogUrl(post.slug, 'en')).toBe(`${origin}/en/blog/${post.slug}`);
    expect(blogAlternateLanguages(post)).toEqual({
      'ko-KR': blogUrl(post.slug, 'ko'),
      'en-US': blogUrl(post.slug, 'en'),
      'ja-JP': blogUrl(post.slug, 'ja'),
      'zh-CN': blogUrl(post.slug, 'zh'),
    });
    const localized = getBlogCountryEdition(post, 'ja');
    expect(localized?.title).toBe(post.translations?.ja?.title);
    expect(localized?.content).toContain('日本');
    expect(getBlogCountryEdition(post, 'en')?.content).toContain('United States');
  });

  it('includes only indexable country URLs with reciprocal hreflang in blog sitemap', async () => {
    const res = await getBlogSitemap();
    const xml = await res.text();
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml).toContain('/en/blog/country-guide-compound');
    expect(xml).toContain('/ja/blog/country-guide-compound');
    expect(xml).toContain('/zh/blog/country-guide-compound');
    expect(xml).toContain('hreflang="en-US"');
    expect(xml).not.toContain('/blog/2026-10-14-compound-interest-wealth-secret');
    expect(xml).not.toContain('<lastmod>' + new Date().toISOString() + '</lastmod>');
  });

  it('sends article summaries, not full text or translations, to the client list', () => {
    const post = createCountryBlogPost('retirement');
    const summary = summarizeBlogPost(post);
    expect(summary.title).toContain('한국');
    expect(Object.keys(summary)).not.toContain('content');
    expect(Object.keys(summary)).not.toContain('translations');
  });

  it('does not serve arbitrary compound-looking missing slugs as existing content', () => {
    expect(getBlogPostBySlug('hacked-compound-nonsense')).toBeUndefined();
    expect(canonicalBlogSlug('2026-10-14-compound-interest-wealth-secret')).toBe('2026-10-14-compound-mv83xp86');
    expect(getAllBlogPosts().filter((p) => p.slug === '2026-10-14-compound-interest-wealth-secret')).toHaveLength(0);
  });
});
