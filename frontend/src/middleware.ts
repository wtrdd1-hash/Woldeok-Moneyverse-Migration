import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DETECTED_LOCALE_COOKIE, LOCALE_COOKIE, detectLocale, isLocale } from '@/lib/locale';

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
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasSession = request.cookies.has('__Host-mv_session') || request.cookies.has('mv_session');

  // Block signed-in members from landing on provider selection or login screen
  if (hasSession && pathname === '/login/providers') {
    return NextResponse.redirect(new URL('/', request.url), { status: 307 });
  }
  if (request.nextUrl.pathname.startsWith('/entry/')) {
    return new NextResponse('This legacy blog post has been permanently removed.', {
      status: 410,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'public, max-age=3600',
        'x-robots-tag': 'noindex, nofollow',
      },
    });
  }

  const response = NextResponse.next();
  const explicit = request.cookies.get(LOCALE_COOKIE)?.value;
  if (!isLocale(explicit)) {
    const country = request.headers.get('cf-ipcountry') ?? request.headers.get('x-vercel-ip-country');
    const detected = detectLocale(country, request.headers.get('accept-language'));
    response.cookies.set(DETECTED_LOCALE_COOKIE, detected, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      secure: true,
    });
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
