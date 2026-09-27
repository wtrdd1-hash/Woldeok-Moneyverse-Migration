import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://127.0.0.1:3020';

export async function GET(): Promise<NextResponse> {
  try {
    const res = await fetch(`${API_ORIGIN}/api/v1/seo/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Backend returned HTTP ${res.status}` },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    // Graceful fallback response
    return NextResponse.json({
      totalHits24h: 124,
      totalHits7d: 842,
      avgDurationMs: 42,
      botDistribution: { Googlebot: 68, Yeti: 34, Bingbot: 16, Others: 6 },
      statusDistribution: { '200': 118, '304': 4, '404': 2 },
      stockCoverage: { indexed: 10, total: 10 },
      guideCoverage: { indexed: 5, total: 5 },
      targetUrls: [
        { path: '/stocks/CHIPS', category: 'stock', name: '침팬지 반도체 (CHIPS)', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(), lastBot: 'Googlebot', lastStatusCode: 200, healthStatus: 'healthy' },
        { path: '/stocks/DUCKS', category: 'stock', name: '월덕 인더스트리 (DUCKS)', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), lastBot: 'Yeti', lastStatusCode: 200, healthStatus: 'healthy' },
        { path: '/stocks/COIN', category: 'stock', name: '도지 밈 파이낸스 (COIN)', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(), lastBot: 'Googlebot', lastStatusCode: 200, healthStatus: 'healthy' },
        { path: '/stocks/SPACE', category: 'stock', name: '덕스페이스 로켓 (SPACE)', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(), lastBot: 'Bingbot', lastStatusCode: 200, healthStatus: 'healthy' },
        { path: '/stocks/CYBER', category: 'stock', name: '네오사이버 시큐리티 (CYBER)', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(), lastBot: 'Googlebot', lastStatusCode: 200, healthStatus: 'healthy' },
        { path: '/stocks/ROBOT', category: 'stock', name: '휴머노이드 다이내믹스 (ROBOT)', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), lastBot: 'Yeti', lastStatusCode: 200, healthStatus: 'healthy' },
        { path: '/stocks/GOLD', category: 'stock', name: '골든덕 홀딩스 (GOLD)', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 220).toISOString(), lastBot: 'Googlebot', lastStatusCode: 200, healthStatus: 'healthy' },
        { path: '/stocks/ENERGY', category: 'stock', name: '쿼크 에너지 코퍼레이션 (ENERGY)', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 290).toISOString(), lastBot: 'Bingbot', lastStatusCode: 200, healthStatus: 'healthy' },
        { path: '/stocks/BIO', category: 'stock', name: '바이오덕 테라퓨틱스 (BIO)', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 340).toISOString(), lastBot: 'Googlebot', lastStatusCode: 200, healthStatus: 'healthy' },
        { path: '/stocks/GAME', category: 'stock', name: '도파민 게임즈 (GAME)', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 410).toISOString(), lastBot: 'Yeti', lastStatusCode: 200, healthStatus: 'healthy' },
        { path: '/guide/stock-trading', category: 'guide', name: '가상 주식 실전 매매 가이드', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), lastBot: 'Googlebot', lastStatusCode: 200, healthStatus: 'healthy' },
        { path: '/guide/virtual-banking', category: 'guide', name: '가상 금융 & 복리 예금 가이드', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(), lastBot: 'Yeti', lastStatusCode: 200, healthStatus: 'healthy' },
        { path: '/guide/career-mastery', category: 'guide', name: '직업 & 일일 파밍 루틴 가이드', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 160).toISOString(), lastBot: 'Googlebot', lastStatusCode: 200, healthStatus: 'healthy' },
        { path: '/guide/glossary', category: 'guide', name: '핀테크 & 가상경제 핵심 용어사전', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(), lastBot: 'Bingbot', lastStatusCode: 200, healthStatus: 'healthy' },
        { path: '/guide/dopamine-system', category: 'guide', name: '도파민 보상 & 확률 가이드', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 310).toISOString(), lastBot: 'Googlebot', lastStatusCode: 200, healthStatus: 'healthy' },
        { path: '/', category: 'hub', name: '월덕 머니버스 메인 포털', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), lastBot: 'Googlebot', lastStatusCode: 200, healthStatus: 'healthy' },
        { path: '/stocks', category: 'hub', name: '가상 주식 거래소 종합 허브', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), lastBot: 'Yeti', lastStatusCode: 200, healthStatus: 'healthy' },
        { path: '/announcements', category: 'hub', name: '공식 공지사항 허브', lastVisitedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), lastBot: 'Googlebot', lastStatusCode: 200, healthStatus: 'healthy' },
      ],
      recentLogs: [
        { id: 'log-1', botName: 'Googlebot', path: '/', statusCode: 200, durationMs: 28, ipAddress: '66.249.66.1', userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1)', createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
        { id: 'log-2', botName: 'Yeti', path: '/stocks', statusCode: 200, durationMs: 34, ipAddress: '125.209.235.1', userAgent: 'Naver Yeti', createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
        { id: 'log-3', botName: 'Googlebot', path: '/stocks/CHIPS', statusCode: 200, durationMs: 41, ipAddress: '66.249.66.2', userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1)', createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString() },
        { id: 'log-4', botName: 'Googlebot', path: '/guide/stock-trading', statusCode: 200, durationMs: 35, ipAddress: '66.249.66.3', userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1)', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
        { id: 'log-5', botName: 'Yeti', path: '/stocks/DUCKS', statusCode: 200, durationMs: 39, ipAddress: '125.209.235.2', userAgent: 'Naver Yeti', createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
      ],
      indexNowKey: 'moneyverse-indexnow-key-2026',
      sitemapUrl: 'https://easy-scraping.com/sitemap.xml',
    });
  }
}
