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
    // 실제 외부 봇 방문이 아직 감지되지 않았을 때의 정직한 초기 상태 (Mock 데이터 제거)
    return NextResponse.json({
      totalHits24h: 0,
      totalHits7d: 0,
      avgDurationMs: 0,
      botDistribution: {},
      statusDistribution: {},
      stockCoverage: { indexed: 0, total: 10 },
      guideCoverage: { indexed: 0, total: 5 },
      targetUrls: [
        { path: '/stocks/CHIPS', category: 'stock', name: '침팬지 반도체 (CHIPS)', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
        { path: '/stocks/DUCKS', category: 'stock', name: '월덕 인더스트리 (DUCKS)', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
        { path: '/stocks/COIN', category: 'stock', name: '도지 밈 파이낸스 (COIN)', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
        { path: '/stocks/SPACE', category: 'stock', name: '덕스페이스 로켓 (SPACE)', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
        { path: '/stocks/CYBER', category: 'stock', name: '네오사이버 시큐리티 (CYBER)', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
        { path: '/stocks/ROBOT', category: 'stock', name: '휴머노이드 다이내믹스 (ROBOT)', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
        { path: '/stocks/GOLD', category: 'stock', name: '골든덕 홀딩스 (GOLD)', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
        { path: '/stocks/ENERGY', category: 'stock', name: '쿼크 에너지 코퍼레이션 (ENERGY)', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
        { path: '/stocks/BIO', category: 'stock', name: '바이오덕 테라퓨틱스 (BIO)', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
        { path: '/stocks/GAME', category: 'stock', name: '도파민 게임즈 (GAME)', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
        { path: '/guide/stock-trading', category: 'guide', name: '가상 주식 실전 매매 가이드', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
        { path: '/guide/virtual-banking', category: 'guide', name: '가상 금융 & 복리 예금 가이드', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
        { path: '/guide/career-mastery', category: 'guide', name: '직업 & 일일 파밍 루틴 가이드', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
        { path: '/guide/glossary', category: 'guide', name: '핀테크 & 가상경제 핵심 용어사전', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
        { path: '/guide/dopamine-system', category: 'guide', name: '도파민 보상 & 확률 가이드', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
        { path: '/', category: 'hub', name: '월덕 머니버스 메인 포털', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
        { path: '/stocks', category: 'hub', name: '가상 주식 거래소 종합 허브', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
        { path: '/announcements', category: 'hub', name: '공식 공지사항 허브', lastVisitedAt: null, lastBot: null, lastStatusCode: null, healthStatus: 'unindexed' },
      ],
      recentLogs: [],
      indexNowKey: 'moneyverse-indexnow-key-2026',
      sitemapUrl: 'https://easy-scraping.com/sitemap.xml',
    });
  }
}
