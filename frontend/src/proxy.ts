import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEFAULT_LOCALE, LOCALE_COOKIE, detectLocale, isLocale, type Locale } from '@/lib/locale';
import { detectCrawlerBot } from '@/lib/bot-detector';
import { getLocalizedCompoundRedirect } from '@/lib/seo-locale-alternates';

const INTERNAL_REWRITE_LOCALE_PARAM = '__mv_path_locale';

const API_ORIGIN = process.env.API_ORIGIN ?? (process.env.NODE_ENV === 'production' ? 'http://127.0.0.1:3000' : 'http://127.0.0.1:3020');

function recordCrawlerHitAsync(request: NextRequest, botName: string, statusCode: number = 200) {
  try {
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
    const path = request.nextUrl.pathname;

    fetch(`${API_ORIGIN}/api/v1/seo/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        botName,
        path,
        statusCode,
        durationMs: 30,
        ipAddress: ip,
        userAgent,
      }),
      cache: 'no-store',
    }).catch(() => {
      // Fire-and-forget telemetry, zero impact on proxy latency
    });
  } catch {
    // Graceful swallow
  }
}

/**
 * Browser-facing production traffic must stay on HTTPS. TLS terminates at the
 * public proxy; the Nest service remains private loopback HTTP and is reached
 * only through the same-origin BFF.
 */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const userAgent = request.headers.get('user-agent');
  const botInfo = detectCrawlerBot(userAgent);

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

  // Legacy /en|ja|zh/tools/compound-calculator used to rewrite to a Korean
  // page with Korean title/H1/canonical despite a foreign-language URL.
  // Route visitors and search engines to the actual translated calculator.
  // nextUrl.clone() retains legitimate query parameters.
  const canonicalCompound = getLocalizedCompoundRedirect(pathname);
  if (canonicalCompound) {
    const localizedUrl = request.nextUrl.clone();
    localizedUrl.pathname = canonicalCompound;
    return NextResponse.redirect(localizedUrl, 308);
  }

  const hasSession = request.cookies.has('__Host-mv_session') || request.cookies.has('mv_session');

  // Block signed-in members from landing on provider selection or login screen.
  if (hasSession && pathname === '/login/providers') {
    return NextResponse.redirect(new URL('/', request.url), { status: 307 });
  }

  // Historic blog routes: Smart 301 Permanent Redirect to preserve SEO rank & link juice
  if (pathname.startsWith('/entry/') || pathname.startsWith('/post/')) {
    if (botInfo.isBot) {
      recordCrawlerHitAsync(request, botInfo.botName, 301);
    }
    let decodedPath = '';
    try {
      decodedPath = decodeURIComponent(pathname).toLowerCase();
    } catch {
      decodedPath = pathname.toLowerCase();
    }

    let destination = '/tools';
    if (/로드맵|백엔드|프론트엔드|네트워크|devops|커리어|공부|학습/.test(decodedPath)) {
      destination = '/roadmap';
    } else if (/클라우드|홈서버|서버|라즈베리파이|우분투|리눅스|docker|도커|배포/.test(decodedPath)) {
      destination = '/guide/career-mastery';
    } else if (/스크래핑|크롤링|access-denied|파이썬|selenium|playwright|우회|403/.test(decodedPath)) {
      destination = '/';
    } else if (/계산기|복리|이자|주식|코인|환율|대출|적금|연봉|퇴직금/.test(decodedPath)) {
      destination = '/tools';
    } else {
      destination = '/blog';
    }

    const redirectUrl = new URL(destination, request.url);
    const redirectRes = NextResponse.redirect(redirectUrl, 301);
    redirectRes.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return redirectRes;
  }

  // Check for explicit query parameter (?lang=en or ?locale=ja)
  const queryLang = request.nextUrl.searchParams.get('lang') || request.nextUrl.searchParams.get('locale');
  const validQueryLocale = isLocale(queryLang) ? (queryLang as Locale) : null;
  // Next may evaluate proxy a second time for a rewritten destination. Keep
  // the locale prefix selection attached to that internal route, independent
  // of the visitor's current country or manual cookie. This is presentation
  // state only; never use this parameter as an authorization signal.
  const rewriteLocaleParam = request.nextUrl.searchParams.get(INTERNAL_REWRITE_LOCALE_PARAM);
  const internalRewrittenLocale = isLocale(rewriteLocaleParam) ? rewriteLocaleParam : null;

  // Check for locale prefix in URL path: /en/stocks, /ja/bank, /zh/wallet, /ko/work, /en, /ja, etc.
  const localePrefixMatch = pathname.match(/^\/([a-z]{2})($|\/.*)/i);
  let explicitPrefixLocale: Locale | null = null;
  let targetPath = pathname;

  if (localePrefixMatch && localePrefixMatch[1]) {
    const rawLang = localePrefixMatch[1].toLowerCase();
    const restPath = localePrefixMatch[2] ?? '';
    const cleanRest = restPath.startsWith('/') ? restPath : (restPath ? `/${restPath}` : '/');

    // Reserved two-letter application routes that are NOT language codes
    const RESERVED_APP_ROUTES = new Set(['fx']);

    if (isLocale(rawLang)) {
      explicitPrefixLocale = rawLang;
      // Physical localized routes (e.g. /[locale]/guide/glossary/..., /[locale]/tools/compound-interest-calculator/...) should not be stripped
      if (cleanRest === '/blog' || cleanRest.startsWith('/blog/') || cleanRest.startsWith('/guide/glossary') || cleanRest.startsWith('/tools/compound-interest-calculator')) {
        targetPath = pathname;
      } else {
        targetPath = cleanRest;
      }
    } else if (!RESERVED_APP_ROUTES.has(rawLang) && ['fr', 'de', 'es', 'it', 'pt', 'ru', 'vi', 'th', 'id', 'ms', 'ar', 'hi'].includes(rawLang)) {
      // User entered a known unsupported language prefix (e.g. /fr/stocks, /de/bank)
      // Automatically redirect to English (/en/...)
      const fallbackUrl = new URL(`/en${cleanRest === '/' ? '' : cleanRest}${request.nextUrl.search}`, request.url);
      return NextResponse.redirect(fallbackUrl, 307);
    }
    if (!targetPath) targetPath = '/';
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
  const detectedGeoLocale = botInfo.isBot ? DEFAULT_LOCALE : detectLocale(country, acceptLang);

  let finalLocale: Locale;

  if (explicitPrefixLocale || internalRewrittenLocale || validQueryLocale) {
    finalLocale = (explicitPrefixLocale || internalRewrittenLocale || validQueryLocale)!;
  } else if (userSavedLocale) {
    finalLocale = userSavedLocale;
  } else {
    finalLocale = detectedGeoLocale;
  }

  // Request headers, not response headers, are what first-request Server Components read.
  // Always replace the inbound value: clients must not choose the SSR locale by spoofing this header.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-moneyverse-locale', finalLocale);
  const rewriteTarget = new URL(`${targetPath}${request.nextUrl.search}`, request.url);
  if (explicitPrefixLocale && targetPath !== pathname) {
    rewriteTarget.searchParams.set(INTERNAL_REWRITE_LOCALE_PARAM, explicitPrefixLocale);
  }
  const response = explicitPrefixLocale && targetPath !== pathname
    ? NextResponse.rewrite(rewriteTarget, { request: { headers: requestHeaders } })
    : NextResponse.next({ request: { headers: requestHeaders } });

  // A localized URL (/ja/stocks, /en/blog, etc.) selects the language for
  // this request only. Following a shared or crawled link must never silently
  // overwrite the visitor's manual preference or disable future GeoIP auto mode.
  // The interactive language switcher writes the explicit preference cookie.
  if (validQueryLocale && !explicitPrefixLocale && !internalRewrittenLocale) {
    response.cookies.set(LOCALE_COOKIE, finalLocale, {
      path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax', secure: true,
    });
  }

  response.headers.set('x-moneyverse-locale', finalLocale);

  if (requestHost === 'test.easy-scraping.com' || process.env.SEO_INDEXING_ENABLED === 'false') {
    response.headers.set('x-robots-tag', 'noindex, nofollow');
  }

  if (botInfo.isBot) {
    recordCrawlerHitAsync(request, botInfo.botName, 200);
  }

  return response;
}

export const config = {
  matcher: ['/:path*'],
};
