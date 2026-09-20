import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DETECTED_LOCALE_COOKIE, LOCALE_COOKIE, detectLocale, isLocale } from '@/lib/locale';

/**
 * Browser-facing production traffic must stay on HTTPS. TLS terminates at the
 * public proxy; the Nest service remains private loopback HTTP and is reached
 * only through the same-origin BFF.
 */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // The host Nginx sends ordinary website traffic to the production frontend.
  // On the miniPC, opt-in routing keeps the public Test hostname attached to
  // the isolated Test frontend without granting Test any Production secret or
  // changing the host Nginx configuration. Test itself leaves this variable
  // unset, so it cannot rewrite back to itself.
  const testOrigin = process.env.TEST_FRONTEND_ORIGIN?.trim().replace(/\/$/, '');
  const requestHost = request.headers.get('host')?.split(':', 1)[0]?.toLowerCase();
  if (testOrigin && requestHost === 'test.easy-scraping.com') {
    return NextResponse.rewrite(new URL(`${pathname}${request.nextUrl.search}`, `${testOrigin}/`));
  }

  // The matcher includes static assets so Test build assets can be routed to
  // the isolated runtime. Production assets do not need locale/auth work.
  if (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/_next/image') ||
    pathname === '/favicon.ico' ||
    /\.(?:svg|png|jpg|jpeg|gif|webp)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (process.env.NODE_ENV === 'production') {
    const base = process.env.APP_BASE_URL;
    const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
    const requestIsHttp =
      forwardedProto === 'http' || (!forwardedProto && request.nextUrl.protocol === 'http:');
    if (base?.startsWith('https://') && requestIsHttp) {
      const target = new URL(`${pathname}${request.nextUrl.search}`, base);
      return NextResponse.redirect(target, 308);
    }
  }

  const hasSession = request.cookies.has('__Host-mv_session') || request.cookies.has('mv_session');

  // Block signed-in members from landing on provider selection or login screen.
  if (hasSession && pathname === '/login/providers') {
    return NextResponse.redirect(new URL('/', request.url), { status: 307 });
  }

  // Historic blog routes are deliberately gone and must not be redirected.
  if (pathname.startsWith('/entry/')) {
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

  if (requestHost === 'test.easy-scraping.com' || process.env.SEO_INDEXING_ENABLED === 'false') {
    response.headers.set('x-robots-tag', 'noindex, nofollow');
  }

  return response;
}

export const config = {
  matcher: ['/:path*'],
};
