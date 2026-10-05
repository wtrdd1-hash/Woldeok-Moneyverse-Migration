/**
 * IndexNow Protocol Real-time Search Engine Submission Engine
 * Supports: Bing, Naver, Yandex, Seznam
 */
import { ALL_SEO_PRESETS } from '@/config/seo-presets.config';
import { ALL_PSEO_POPULAR_SLUGS } from '@/config/pseo-stocks.config';
import { REAL_ESTATE_PRESETS } from '@/config/real-estate-presets.config';
import { KIMCHI_PREMIUM_PRESETS } from '@/config/kimchi-premium-presets.config';
import { CAPITAL_GAINS_TAX_PRESETS } from '@/config/capital-gains-tax-presets.config';
import { GIFT_TAX_PRESETS } from '@/config/pseo-gift-tax.config';
import { GLOBAL_COMPOUND_PRESETS } from '@/config/pseo-compound-global.config';
import { GLOSSARY_TERMS } from '@/config/pseo-glossary.config';
import { getPublicSitemapRoutes } from '@/config/routes.config';

export const INDEXNOW_HOST = 'easy-scraping.com';
export const INDEXNOW_KEY = 'moneyverse-indexnow-key-2026';
export const INDEXNOW_KEY_LOCATION = `https://${INDEXNOW_HOST}/moneyverse-indexnow-key-2026.txt`;

export interface IndexNowPayload {
  readonly host: string;
  readonly key: string;
  readonly keyLocation: string;
  readonly urlList: readonly string[];
}

export interface IndexNowResult {
  readonly success: boolean;
  readonly submittedCount: number;
  readonly status: number;
  readonly responseText?: string;
  readonly error?: string;
}

/**
 * Generates the complete list of 400+ public indexable URLs for IndexNow batch submission.
 */
export function getAllPublicUrlsForIndexNow(): readonly string[] {
  const base = `https://${INDEXNOW_HOST}`;
  const urls = new Set<string>();

  // 1. Static Core Public Routes
  const publicRoutes = getPublicSitemapRoutes();
  for (const route of publicRoutes) {
    if (!route.path.includes('[')) {
      const clean = route.path.startsWith('/') ? route.path : `/${route.path}`;
      urls.add(`${base}${clean === '/' ? '' : clean}`);
    }
  }

  // 2. 300+ Longtail pSEO Stock Calculator URLs
  for (const slug of ALL_PSEO_POPULAR_SLUGS) {
    urls.add(`${base}/tools/stock-calculator/${slug}`);
  }

  // 3. Preset Calculators (Compound, Stock, Farming)
  for (const preset of ALL_SEO_PRESETS) {
    if (preset.category === 'compound') {
      urls.add(`${base}/tools/compound-calculator/${preset.slug}`);
    } else if (preset.category === 'stock') {
      urls.add(`${base}/tools/stock-calculator/${preset.slug}`);
    } else if (preset.category === 'farming') {
      urls.add(`${base}/tools/farming-calculator/${preset.slug}`);
    }
  }

  // 4. 신규 가상 부동산 계산기 프리셋
  urls.add(`${base}/tools/real-estate-calculator`);
  for (const p of REAL_ESTATE_PRESETS) {
    urls.add(`${base}/tools/real-estate-calculator/${p.slug}`);
  }

  // 5. 신규 코인 김치프리미엄 계산기 프리셋
  urls.add(`${base}/tools/kimchi-premium-calculator`);
  for (const p of KIMCHI_PREMIUM_PRESETS) {
    urls.add(`${base}/tools/kimchi-premium-calculator/${p.slug}`);
  }

  // 6. 신규 주식 양도소득세 계산기 프리셋
  urls.add(`${base}/tools/capital-gains-tax-calculator`);
  for (const p of CAPITAL_GAINS_TAX_PRESETS) {
    urls.add(`${base}/tools/capital-gains-tax-calculator/${p.slug}`);
  }

  // 7. 신규 2026 증여세 계산기 프리셋 (13개 롱테일)
  urls.add(`${base}/tools/gift-tax-calculator`);
  for (const p of GIFT_TAX_PRESETS) {
    urls.add(`${base}/tools/gift-tax-calculator/${p.slug}`);
  }

  // 8. 신규 글로벌 복리 & FIRE 은퇴 계산기 (EN, JA, ZH 3개 국어 × 5대 프리셋)
  for (const loc of ['en', 'ja', 'zh']) {
    urls.add(`${base}/${loc}/tools/compound-interest-calculator`);
    for (const p of GLOBAL_COMPOUND_PRESETS) {
      urls.add(`${base}/${loc}/tools/compound-interest-calculator/${p.slug}`);
    }
  }

  // 9. 50대 금융 용어사전 가이드 허브
  urls.add(`${base}/guide/glossary`);
  for (const t of GLOSSARY_TERMS) {
    urls.add(`${base}/guide/glossary/${t.slug}`);
  }

  // 10. Virtual Real Estate & Personal Spaces
  urls.add(`${base}/spaces`);
  urls.add(`${base}/spaces/real-estate`);

  return Array.from(urls);
}

/**
 * Submits a batch of URLs (up to 10,000) to IndexNow API.
 */
export async function submitToIndexNow(urls?: readonly string[]): Promise<IndexNowResult> {
  const targetUrls = urls !== undefined ? urls : getAllPublicUrlsForIndexNow();

  if (targetUrls.length === 0) {
    return { success: true, submittedCount: 0, status: 200 };
  }

  const payload: IndexNowPayload = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: targetUrls.slice(0, 10000),
  };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    // 200 (OK), 202 (Accepted) are success codes according to IndexNow RFC
    const isSuccess = res.status === 200 || res.status === 202;
    const responseText = await res.text().catch(() => '');

    return {
      success: isSuccess,
      submittedCount: payload.urlList.length,
      status: res.status,
      responseText,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      submittedCount: payload.urlList.length,
      status: 500,
      error: errorMessage,
    };
  }
}
