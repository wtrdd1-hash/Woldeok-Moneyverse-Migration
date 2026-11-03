import { NextResponse } from 'next/server';
import type { BlogPost } from '@/app/blog/blog.types';
import { getAllBlogPosts } from '@/app/blog/blog-data';
import { verifiedPublicArticles } from '@/app/blog/blog-verified-client';
import { blogAlternateLanguages, blogHubUrl, blogUrl, canonicalBlogSlug, hasCountryEdition, isBlogDiscoverable } from '@/app/blog/blog-seo';

export const dynamic = 'force-dynamic';
const LOCALES = ['ko', 'en', 'ja', 'zh'] as const;
const XML_HEADERS = { 'Content-Type': 'application/xml; charset=utf-8' };
const EMPTY_XML = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"></urlset>';

function esc(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

/** Content-update evidence must be recorded on the article, never inferred from crawler time. */
function reliableLastmod(value: unknown): string | undefined {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return undefined;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : undefined;
}

function entry(url: string, date: string | undefined, languages: Record<string, string>): string {
  const modified = date ? '<lastmod>' + esc(date) + '</lastmod>' : '';
  const alternate = Object.entries(languages).map(([language, href]) =>
    '<xhtml:link rel="alternate" hreflang="' + esc(language) + '" href="' + esc(href) + '" />').join('\n');
  return '<url><loc>' + esc(url) + '</loc>' + modified + alternate + '</url>';
}

/** Reusable and deterministic source for canonical blog sitemap URLs. */
export function buildBlogSitemapXml(posts: readonly BlogPost[]): string {
  // The hub resolves verified DB articles before legacy posts: use the same precedence.
  const unique = new Map<string, BlogPost>();
  for (const post of posts) {
    if (!isBlogDiscoverable(post)) continue;
    const slug = canonicalBlogSlug(post.slug);
    if (!unique.has(slug)) unique.set(slug, post);
  }
  const publicPosts = [...unique.values()];
  const latest = publicPosts.map(post => reliableLastmod(post.updatedAt))
    .filter((date): date is string => Boolean(date)).sort().at(-1);
  const hubs = Object.fromEntries(LOCALES.map(locale => [
    ({ ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN' })[locale], blogHubUrl(locale),
  ]));
  const entries = LOCALES.map(locale => entry(blogHubUrl(locale), latest, hubs));
  for (const post of publicPosts) {
    const alternates = blogAlternateLanguages(post);
    for (const locale of LOCALES) {
      if (hasCountryEdition(post, locale)) {
        entries.push(entry(blogUrl(post.slug, locale), reliableLastmod(post.updatedAt), alternates));
      }
    }
  }
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + entries.join('\n') + '\n</urlset>';
}

export async function GET() {
  if (process.env.SEO_INDEXING_ENABLED === 'false') {
    // Test/noindex instances must never submit public blog URLs to search engines.
    return new NextResponse(EMPTY_XML, {
      headers: { ...XML_HEADERS, 'Cache-Control': 'no-store' },
    });
  }
  const posts = [...await verifiedPublicArticles(), ...getAllBlogPosts()];
  return new NextResponse(buildBlogSitemapXml(posts), {
    headers: { ...XML_HEADERS, 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  });
}
