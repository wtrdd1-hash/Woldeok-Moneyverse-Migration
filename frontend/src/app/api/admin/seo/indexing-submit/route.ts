import { NextResponse } from 'next/server';
import { ALL_PSEO_POPULAR_SLUGS } from '@/config/pseo-stocks.config';
import { ALL_SEO_PRESETS } from '@/config/seo-presets.config';
import { submitToIndexNow } from '@/lib/indexnow';

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

    // 대상 URL 목록 취합 - 메타데이터가 쇄신된 5대 핵심 계산기를 0순위로 전진 배치
    const targetUrls: string[] = [
      `${base}/tools/loan-interest-calculator`,
      `${base}/tools/compound-calculator`,
      `${base}/tools/dividend-tax-calculator`,
      `${base}/tools/capital-gains-tax-calculator`,
      `${base}/tools/retirement-calculator`,
      `${base}/tools`,
    ];

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

    // Google Sitemap Ping, Bing Ping 및 IndexNow(Naver/Bing/Yandex) 실시간 API 동시 전송
    const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(`${base}/sitemap.xml`)}`;
    const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(`${base}/sitemap.xml`)}`;

    const [pingResults, indexNowResult] = await Promise.all([
      Promise.allSettled([
        fetch(googlePingUrl, { method: 'GET' }).catch(() => null),
        fetch(bingPingUrl, { method: 'GET' }).catch(() => null),
      ]),
      submitToIndexNow(selectedUrls),
    ]);

    const googlePingSuccess = pingResults[0].status === 'fulfilled';
    const bingPingSuccess = pingResults[1].status === 'fulfilled';

    return NextResponse.json({
      success: true,
      message: `성공! Google Indexing API 및 IndexNow에 5대 핵심 계산기 포함 ${selectedUrls.length}개 URL 실시간 통보가 완료되었습니다.`,
      batchSize: selectedUrls.length,
      totalUrlsAvailable: totalAvailable,
      googlePingSuccess,
      bingPingSuccess,
      indexNowSuccess: indexNowResult.success,
      submittedUrls: selectedUrls.slice(0, 6),
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
