// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { getAllBlogPosts, generateDailyAiBlogPost, withoutLegacyBlogViews } from './blog-data';
import { GET as getPublicBlog } from '../api/blog/route';
import { BlogHubClient } from './blog-hub-client';
import { BlogPostClient } from './[slug]/blog-post-client';
import { summarizeBlogPost } from './blog-page-server';

const hasViews = (value: object) => Object.prototype.hasOwnProperty.call(value, 'views');

describe('public blog readership provenance (C v1040)', () => {
  it('strips legacy persisted view counts without mutating the original article', () => {
    const article = { ...getAllBlogPosts()[0]!, views: 3840 };
    const normalized = withoutLegacyBlogViews(article);
    expect(hasViews(normalized)).toBe(false);
    expect(normalized.slug).toBe(article.slug);
    expect(hasViews(article)).toBe(true);
  });

  it('does not manufacture readership in published articles, generated drafts, or public API JSON', async () => {
    const posts = getAllBlogPosts();
    expect(posts.length).toBeGreaterThan(0);
    expect(posts.every((post) => !hasViews(post))).toBe(true);
    expect(hasViews(generateDailyAiBlogPost({ category: 'WEALTH', country: 'KR' }))).toBe(false);
    const response = await getPublicBlog();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.posts.length).toBeGreaterThan(0);
    expect(body.posts.every((post: object) => !hasViews(post))).toBe(true);
  });

  it('keeps publication date and reading-time metadata without publishing unverified counts in the blog hub', () => {
    const post = getAllBlogPosts()[0]!;
    const summary = summarizeBlogPost(post);
    expect(hasViews(summary)).toBe(false);
    const html = renderToStaticMarkup(<BlogHubClient initialPosts={[summary]} locale="ko" />);
    expect(html).toContain(post.title);
    expect(html).toContain('완독');
    expect(html).not.toMatch(/조회\s*[\d,]+\s*회/);
    expect(html).not.toContain('3840회');
  });

  it('shows accessible multilingual article metadata without invented views', () => {
    const post = getAllBlogPosts()[0]!;
    for (const locale of ['ko', 'en', 'ja', 'zh'] as const) {
      const html = renderToStaticMarkup(<BlogPostClient post={post} locale={locale} />);
      expect(html).toContain('<article');
      expect(html).toContain('Article language');
      expect(html).not.toMatch(/(?:조회|Views|閲覧|浏览)\s*[\d,]+/);
    }
  });
});
