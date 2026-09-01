import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * `easy-scraping.com` previously served an unrelated technical blog under
 * `/entry/*`.  Those articles are not part of Moneyverse and must never be
 * redirected to the new service: that would make both visitors and search
 * engines believe the old article still exists.
 *
 * A 410 is intentionally stronger than the application's normal 404.  It
 * tells crawlers that the resource was deliberately removed, so historic
 * Search Console entries can fall out of the index on their next crawl.
 */
export function middleware(_request: NextRequest) {
  return new NextResponse('This legacy blog post has been permanently removed.', {
    status: 410,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

export const config = {
  matcher: '/entry/:path*',
};
