import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DETECTED_LOCALE_COOKIE, LOCALE_COOKIE, detectLocale, isLocale } from '@/lib/locale';

/**
 * Browser-facing production traffic must stay on HTTPS. TLS terminates at the
 * public proxy; the Nest service remains private loopback HTTP and is reached
 * only through the same-origin BFF.
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

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
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
