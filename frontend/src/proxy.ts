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

  // Historic blog routes: Return HTTP 410 Gone to cleanly remove obsolete tech-blog URLs from Google/Naver index and avoid Soft 404 penalties
  if (pathname.startsWith('/entry/') || pathname.startsWith('/blog/') || pathname.startsWith('/post/')) {
    const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"/><title>이전 블로그 콘텐츠 안내 (410 Gone) | 월덕 머니버스</title><meta name="robots" content="noindex, nofollow"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>body{background:#090d16;color:#e2e8f0;font-family:-apple-system,BlinkMacSystemFont,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;text-align:center}.card{max-width:540px;background:#0f172a;border:1px solid #1e293b;border-radius:24px;padding:40px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5)}h1{font-size:22px;color:#f8fafc;margin:0 0 12px}p{font-size:14px;color:#94a3b8;line-height:1.6;margin:0 0 24px}a{display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:12px;text-decoration:none;transition:background 0.2s}a:hover{background:#1d4ed8}</style></head><body><div class="card"><h1>과거 블로그 글 서비스 종료 안내</h1><p>해당 기술 블로그 게시물은 서비스 통합 및 도메인 개편으로 인해 영구 삭제(410 Gone)되었습니다.<br/>월덕 머니버스의 실시간 가상 주식, 복리 예금 및 300+개 금융 계산기 도구를 이용해 보세요.</p><a href="/tools">월덕 머니버스 금융 도구 바로가기 →</a></div></body></html>`;
    return new NextResponse(html, {
      status: 410,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
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

  // Make an explicit locale visible to the rewritten server component in
  // the same request. Response cookies only affect the next navigation.
  if (explicitPrefixLocale) {
    request.cookies.set(DETECTED_LOCALE_COOKIE, explicitPrefixLocale);
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

  // Keep each indexable locale on a stable URL. The root URL is the Korean
  // canonical; first-time visitors detected as another supported locale move
  // to that locale's explicit URL instead of receiving different HTML at '/'.
  const rootLocale = validQueryLocale ?? userSavedLocale ?? detectedGeoLocale;
  if (pathname === '/' && rootLocale !== 'ko') {
    const localeUrl = new URL(`/${rootLocale}${request.nextUrl.search}`, request.url);
    localeUrl.searchParams.delete('lang');
    localeUrl.searchParams.delete('locale');
    const redirect = NextResponse.redirect(localeUrl, 307);
    if (!userSavedLocale && !validQueryLocale) {
      redirect.cookies.set(DETECTED_LOCALE_COOKIE, rootLocale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
        secure: true,
      });
    }
    redirect.headers.set('x-moneyverse-locale', rootLocale);
    return redirect;
  }

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
