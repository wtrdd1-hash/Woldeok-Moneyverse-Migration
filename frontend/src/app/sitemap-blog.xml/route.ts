import { NextResponse } from 'next/server';
import { verifiedPublicArticles } from '../blog/blog-verified-client';
import { blogHubUrl, blogUrl, isBlogDiscoverable, type BlogLocale } from '../blog/blog-seo';

export const dynamic = 'force-dynamic';

const nativeLocale = { KR:'ko', US:'en', JP:'ja', CN:'zh' } as const;

/** Only independently verified published articles may be submitted to crawlers. */
export async function GET() {
  if (process.env.SEO_INDEXING_ENABLED === 'false') {
    return new NextResponse('', { status: 503, headers: { 'Cache-Control':'no-store' } });
  }
  const posts = (await verifiedPublicArticles()).filter(post =>
    post.status === 'PUBLISHED' && isBlogDiscoverable(post) && post.verificationReceipt &&
    post.country && post.country in nativeLocale,
  );
  // Never replace previously discovered verified URLs with an empty 200 sitemap
  // when the upstream is temporarily unavailable. Public API stays read-only.
  if (posts.length === 0) {
    return new NextResponse('Verified blog listing unavailable', {
      status:503, headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex'},
    });
  }
  const urls = new Map<string, string | undefined>();
  for (const post of posts) {
    const locale = nativeLocale[post.country as keyof typeof nativeLocale] as BlogLocale;
    const updatedAt = Date.parse(post.updatedAt);
    urls.set(blogUrl(post.slug,locale), Number.isFinite(updatedAt)
      ? new Date(updatedAt).toISOString() : undefined);
    urls.set(blogHubUrl(locale), undefined);
  }
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + [...urls].map(([url,lastMod]) => `  <url><loc>${url}</loc>${lastMod ? `<lastmod>${lastMod}</lastmod>` : ''}</url>`).join('\n')
    + '\n</urlset>';
  return new NextResponse(xml, {
    headers: {
      'Content-Type':'application/xml; charset=utf-8',
      'Cache-Control':'public, max-age=120, s-maxage=120',
    },
  });
}
