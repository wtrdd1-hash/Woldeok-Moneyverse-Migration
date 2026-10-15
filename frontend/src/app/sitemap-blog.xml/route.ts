import { NextResponse } from 'next/server';
import { getAllBlogPosts } from '@/app/blog/blog-data';
import { blogAlternateLanguages, blogHubUrl, blogUrl, hasCountryEdition } from '@/app/blog/blog-seo';

export const dynamic = 'force-dynamic';
const LOCALES = ['ko', 'en', 'ja', 'zh'] as const;
function esc(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
}
function entry(url: string, date: string, languages: Record<string, string>) {
  const alternate = Object.entries(languages).map(([language, href]) =>
    '<xhtml:link rel="alternate" hreflang="' + language + '" href="' + esc(href) + '" />').join('\n');
  return '<url><loc>' + esc(url) + '</loc><lastmod>' + date + '</lastmod>' + alternate + '</url>';
}
export async function GET() {
  const posts = getAllBlogPosts();
  const latest = posts.map(p => p.updatedAt).sort().at(-1) ?? '2026-10-15T14:00:00.000Z';
  const hubs = Object.fromEntries(LOCALES.map(l => [({ko:'ko-KR',en:'en-US',ja:'ja-JP',zh:'zh-CN'})[l], blogHubUrl(l)]));
  const entries = LOCALES.map(l => entry(blogHubUrl(l), new Date(latest).toISOString(), hubs));
  for (const post of posts) {
    const alternatives = blogAlternateLanguages(post);
    for (const locale of LOCALES) {
      if (hasCountryEdition(post, locale)) entries.push(entry(blogUrl(post.slug, locale),new Date(post.updatedAt).toISOString(),alternatives));
    }
  }
  const doc = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + entries.join('\n') + '\n</urlset>';
  return new NextResponse(doc, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' } });
}
