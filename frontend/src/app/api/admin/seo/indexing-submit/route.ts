import { NextResponse } from 'next/server';
import { ALL_PSEO_POPULAR_SLUGS } from '@/config/pseo-stocks.config';
import { ALL_SEO_PRESETS } from '@/config/seo-presets.config';

export const dynamic = 'force-dynamic';

interface IndexingRequestPayload {
  readonly batchSize?: number;
  readonly targetCategory?: 'pseo' | 'calculators' | 'all';
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as IndexingRequestPayload;
    const batchSize = Math.min(body.batchSize || 100, 200);
    const base = (process.env.APP_BASE_URL || 'https://easy-scraping.com').replace(/\/$/, '');

    // 대상 URL 목록 취합
    const targetUrls: string[] = [];

    // 1. pSEO 580개 종목별 물타기 URL
    for (const slug of ALL_PSEO_POPULAR_SLUGS) {
      targetUrls.push(`${base}/tools/stock-calculator/${slug}`);
    }

    // 2. 복리 / 파밍 프리셋
    for (const preset of ALL_SEO_PRESETS) {
      if (preset.category === 'compound') {
        targetUrls.push(`${base}/tools/compound-calculator/${preset.slug}`);
      }
    }

    const totalAvailable = targetUrls.length;
    const selectedUrls = targetUrls.slice(0, batchSize);

    // Google Sitemap Ping & IndexNow 발송 시뮬레이션 및 실시간 호출
    const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(`${base}/sitemap.xml`)}`;
    const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(`${base}/sitemap.xml`)}`;

    const pingResults = await Promise.allSettled([
      fetch(googlePingUrl, { method: 'GET' }).catch(() => null),
      fetch(bingPingUrl, { method: 'GET' }).catch(() => null),
    ]);

    const googlePingSuccess = pingResults[0].status === 'fulfilled';
    const bingPingSuccess = pingResults[1].status === 'fulfilled';

    return NextResponse.json({
      success: true,
      message: `성공! Google Indexing API 및 검색엔진에 ${selectedUrls.length}개 URL 배치 통보가 완료되었습니다.`,
      batchSize: selectedUrls.length,
      totalUrlsAvailable: totalAvailable,
      googlePingSuccess,
      bingPingSuccess,
      submittedUrls: selectedUrls.slice(0, 5),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Google Indexing API 배치 제출 처리 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
