import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://127.0.0.1:3020';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const base = (process.env.APP_BASE_URL || 'https://easy-scraping.com').replace(/\/$/, '');
    const sitemapUrl = body?.sitemapUrl?.trim() || `${base}/sitemap.xml`;

    // 1단계: 백엔드 GSC 공식 Sitemaps API 호출
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

    // 2단계: Google / Bing Sitemap Ping 동시 전송
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
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { success: false, message: `사이트맵 구글 등록 실패: ${message}` },
      { status: 500 },
    );
  }
}
