import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://127.0.0.1:3020';

// 메모리 기반 1분 Rate Limiting 버킷 (IP당 최대 10회)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 10;
}

function assertAllowedSitemapUrl(urlStr: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    throw new Error('유효하지 않은 URL 형식입니다.');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('허용되지 않는 프로토콜입니다.');
  }

  const hostname = parsed.hostname.toLowerCase();
  const baseHostname = new URL(process.env.APP_BASE_URL || 'https://easy-scraping.com').hostname.toLowerCase();

  const ALLOWED_HOSTS = new Set([
    'easy-scraping.com',
    'www.easy-scraping.com',
    'localhost',
    '127.0.0.1',
    baseHostname,
  ]);

  if (!ALLOWED_HOSTS.has(hostname)) {
    throw new Error('보안 정책에 따라 외부 도메인의 사이트맵은 제출할 수 없습니다.');
  }

  if (!/^\/sitemap[a-zA-Z0-9\-_]*\.xml$/i.test(parsed.pathname)) {
    throw new Error('사이트맵 파일 형식(/sitemap*.xml)만 허용됩니다.');
  }

  return parsed;
}

export async function POST(req: Request) {
  try {
    // 1단계: Rate Limit 검증
    const forwarded = req.headers.get('x-forwarded-for') || '';
    const clientIp = forwarded.split(',')[0]?.trim() || 'unknown-client';
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { success: false, message: '요청 빈도가 너무 높습니다. 1분 후 다시 시도해 주세요.' },
        { status: 429 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const base = (process.env.APP_BASE_URL || 'https://easy-scraping.com').replace(/\/$/, '');
    const requestedSitemap = body?.sitemapUrl?.trim() || `${base}/sitemap.xml`;

    // 2단계: 엄격한 SSRF 화이트리스트 검증
    const safeUrl = assertAllowedSitemapUrl(requestedSitemap);
    const sitemapUrl = safeUrl.toString();

    // 3단계: 백엔드 GSC 공식 Sitemaps API 호출
    let backendResult = null;
    try {
      const res = await fetch(`${API_ORIGIN}/api/v1/seo/gsc/submit-sitemap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sitemapUrl }),
      });
      if (res.ok) {
        backendResult = await res.json();
      }
    } catch {
      // Backend optional fallback
    }

    // 4단계: Google / Bing Sitemap Ping 동시 전송
    const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;

    const [googlePing, bingPing] = await Promise.allSettled([
      fetch(googlePingUrl, { method: 'GET' }).catch(() => null),
      fetch(bingPingUrl, { method: 'GET' }).catch(() => null),
    ]);

    const hostname = new URL(base).hostname;
    const defaultProperty = `sc-domain:${hostname}`;
    const directConsoleUrl =
      backendResult?.directConsoleUrl ||
      `https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(defaultProperty)}`;

    const isGscSubmitted = backendResult?.status === 'SUBMITTED';

    return NextResponse.json({
      success: true,
      isGscSubmitted,
      gscMessage: backendResult?.message || 'Google Search Console 직접 등록 콘솔이 준비되었습니다.',
      directConsoleUrl,
      sitemapUrl,
      googlePingSuccess: googlePing.status === 'fulfilled',
      bingPingSuccess: bingPing.status === 'fulfilled',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '보안 검증 실패';
    return NextResponse.json(
      { success: false, message: `사이트맵 구글 등록 실패: ${message}` },
      { status: 400 },
    );
  }
}
