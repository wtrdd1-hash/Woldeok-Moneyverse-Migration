import { NextResponse } from 'next/server';
import { verifiedPublicArticles } from '../blog/blog-verified-client';
import { getAllBlogPosts } from '../blog/blog-data';
import { blogHubUrl, blogUrl, hasCountryEdition, isBlogDiscoverable, type BlogLocale } from '../blog/blog-seo';

export const dynamic = 'force-dynamic';

const nativeLocale = { KR:'ko', US:'en', JP:'ja', CN:'zh' } as const;

/** Only independently verified published articles may be submitted to crawlers. */
export async function GET() {
  if (process.env.SEO_INDEXING_ENABLED === 'false') {
    return new NextResponse('', { status: 503, headers: { 'Cache-Control':'no-store' } });
  }
  const posts = [...await verifiedPublicArticles(), ...getAllBlogPosts()]
    .filter(isBlogDiscoverable);
  if (posts.length === 0) {
    return new NextResponse('Blog listing unavailable', {
      status:503, headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex'},
    });
  }
  const urls = new Map<string, string | undefined>();
  for (const post of posts) {
    const locales: BlogLocale[] = (post.verificationReceipt || post.verificationState === 'UNVERIFIED') && post.country && post.country in nativeLocale
      ? [nativeLocale[post.country as keyof typeof nativeLocale]]
      : (['ko','en','ja','zh'] as const).filter(locale => hasCountryEdition(post,locale));
    for (const locale of locales) {
      const updatedAt = Date.parse(post.updatedAt);
      urls.set(blogUrl(post.slug,locale), Number.isFinite(updatedAt)
        ? new Date(updatedAt).toISOString() : undefined);
      urls.set(blogHubUrl(locale), undefined);
    }
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
