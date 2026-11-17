import { NextResponse } from 'next/server';

const INDEXNOW_KEY = '7ebcf7a3424141ee8dbba209efbe8085';
const HOST = 'easy-scraping.com';
const KEY_LOCATION = 'https://easy-scraping.com/7ebcf7a3424141ee8dbba209efbe8085.txt';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const urls: string[] = Array.isArray(body?.urls) && body.urls.length > 0
      ? body.urls
      : [
          'https://easy-scraping.com/',
          'https://easy-scraping.com/calculators',
          'https://easy-scraping.com/tools/stock-calculator',
          'https://easy-scraping.com/tools/compound-calculator',
          'https://easy-scraping.com/tools/salary-calculator',
          'https://easy-scraping.com/tools/dividend-tax-calculator',
          'https://easy-scraping.com/tools/loan-interest-calculator',
          'https://easy-scraping.com/tools/capital-gains-tax-calculator',
          'https://easy-scraping.com/tools/isa-calculator',
          'https://easy-scraping.com/tools/fire-calculator',
          'https://easy-scraping.com/feed.xml',
          'https://easy-scraping.com/llms.txt',
        ];

    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls,
    };

    // 1. Naver Search Advisor IndexNow API
    const naverRes = await fetch('https://searchadvisor.naver.com/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    }).catch((err) => ({ ok: false, status: 500, error: String(err) }));

    // 2. Global IndexNow API (Bing / Yandex)
    const globalRes = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    }).catch((err) => ({ ok: false, status: 500, error: String(err) }));

    return NextResponse.json({
      success: naverRes.ok || globalRes.ok,
      naver: { ok: naverRes.ok, status: naverRes.status },
      global: { ok: globalRes.ok, status: globalRes.status },
      submittedUrlsCount: urls.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
