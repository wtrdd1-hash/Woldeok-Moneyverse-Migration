import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DETECTED_LOCALE_COOKIE, LOCALE_COOKIE, detectLocale, isLocale, type Locale } from '@/lib/locale';

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
  const testOrigin = process.env.TEST_FRONTEND_ORIGIN?.trim().replace(/\/$/, '');
  const requestHost = request.headers.get('host')?.split(':', 1)[0]?.toLowerCase();
  if (testOrigin && requestHost === 'test.easy-scraping.com') {
    return NextResponse.rewrite(new URL(`${pathname}${request.nextUrl.search}`, `${testOrigin}/`));
  }

  // Local health check endpoint for internal probes (Zero latency, no redirect)
  if (pathname === '/api/health') {
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  }

  // High-performance static asset routing with immutable caching
  if (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/_next/image') ||
    pathname === '/favicon.ico' ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|ico|css|js)$/i.test(pathname)
  ) {
    const res = NextResponse.next();
    if (pathname.startsWith('/_next/static/') || /\.(?:woff2?|png|svg|webp)$/i.test(pathname)) {
      res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
    return res;
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

  // Historic blog routes: 301 Permanent Redirect to capture search traffic into Moneyverse developer career & tools
  if (pathname.startsWith('/entry/') || pathname.startsWith('/blog/') || pathname.startsWith('/post/')) {
    const redirectUrl = new URL('/guide/career-mastery?ref=legacy_tech_blog', request.url);
    return NextResponse.redirect(redirectUrl, 301);
  }

  // Check for explicit query parameter (?lang=en or ?locale=ja)
  const queryLang = request.nextUrl.searchParams.get('lang') || request.nextUrl.searchParams.get('locale');
  const validQueryLocale = isLocale(queryLang) ? (queryLang as Locale) : null;

  // Check for locale prefix in URL path: /en/stocks, /ja/bank, /zh/wallet, /ko/work, /en, /ja, etc.
  const localePrefixMatch = pathname.match(/^\/([a-z]{2})($|\/.*)/i);
  let explicitPrefixLocale: Locale | null = null;
  let targetPath = pathname;

  if (localePrefixMatch && localePrefixMatch[1]) {
    const rawLang = localePrefixMatch[1].toLowerCase();
    const restPath = localePrefixMatch[2] ?? '';
    const cleanRest = restPath.startsWith('/') ? restPath : (restPath ? `/${restPath}` : '/');

    if (isLocale(rawLang)) {
      explicitPrefixLocale = rawLang;
      // Physical localized routes (e.g. /[locale]/guide/glossary/..., /[locale]/tools/compound-interest-calculator/...) should not be stripped
      if (cleanRest.startsWith('/guide/glossary') || cleanRest.startsWith('/tools/compound-interest-calculator')) {
        targetPath = pathname;
      } else {
        targetPath = cleanRest;
      }
    } else {
      // User entered an unsupported language prefix (e.g. /fr/stocks, /de/bank)
      // Automatically redirect to English (/en/...)
      const fallbackUrl = new URL(`/en${cleanRest === '/' ? '' : cleanRest}${request.nextUrl.search}`, request.url);
      return NextResponse.redirect(fallbackUrl, 307);
    }
    if (!targetPath) targetPath = '/';
  }

  // Prepare response: If targetPath was rewritten from a prefix, perform internal rewrite
  let response: NextResponse;
  if (explicitPrefixLocale && targetPath !== pathname) {
    const rewriteUrl = new URL(`${targetPath}${request.nextUrl.search}`, request.url);
    response = NextResponse.rewrite(rewriteUrl);
  } else {
    response = NextResponse.next();
  }


  // Determine active locale with 3-tier precedence:
  // Tier 1: Explicit URL prefix or Query param (?lang=ja)
  // Tier 2: User's saved Cookie (wdmv_locale) - preserved 100% if manually chosen
  // Tier 3: GeoIP Country Header (CF-IPCountry / x-vercel-ip-country) + Accept-Language detection
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const userSavedLocale = isLocale(cookieLocale) ? (cookieLocale as Locale) : null;

  const country =
    request.headers.get('cf-ipcountry') ??
    request.headers.get('x-vercel-ip-country') ??
    request.headers.get('x-country-code');
  const acceptLang = request.headers.get('accept-language');
  const detectedGeoLocale = detectLocale(country, acceptLang);

  let finalLocale: Locale;

  if (explicitPrefixLocale || validQueryLocale) {
    finalLocale = (explicitPrefixLocale || validQueryLocale)!;
    response.cookies.set(LOCALE_COOKIE, finalLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      secure: true,
    });
  } else if (userSavedLocale) {
    finalLocale = userSavedLocale;
  } else {
    // Brand new visitor: pass detected GeoIP locale via header & detected cookie only,
    // without polluting LOCALE_COOKIE (which is strictly reserved for explicit user preference)
    finalLocale = detectedGeoLocale;
    response.cookies.set(DETECTED_LOCALE_COOKIE, finalLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      secure: true,
    });
  }

  response.headers.set('x-moneyverse-locale', finalLocale);

  if (requestHost === 'test.easy-scraping.com' || process.env.SEO_INDEXING_ENABLED === 'false') {
    response.headers.set('x-robots-tag', 'noindex, nofollow');
  }

  return response;
}

export const config = {
  matcher: ['/:path*'],
};
