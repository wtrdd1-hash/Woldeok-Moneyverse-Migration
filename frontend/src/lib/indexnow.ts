/**
 * IndexNow Protocol Real-time Search Engine Submission Engine
 * Supports: Bing, Naver, Yandex, Seznam
 */
import { ALL_SEO_PRESETS } from '@/config/seo-presets.config';
import { ALL_PSEO_POPULAR_SLUGS } from '@/config/pseo-stocks.config';
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
 * Generates the complete list of 300+ public indexable URLs for IndexNow batch submission.
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

  // 4. Virtual Real Estate & Personal Spaces
  urls.add(`${base}/spaces`);
  urls.add(`${base}/spaces/real-estate`);

  return Array.from(urls);
}

/**
 * Submits a batch of URLs (up to 10,000) to IndexNow API.
 */
export async function submitToIndexNow(urls?: readonly string[]): Promise<IndexNowResult> {
  const targetUrls = urls && urls.length > 0 ? urls : getAllPublicUrlsForIndexNow();

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
  } catch (err) {
    return {
      success: false,
      submittedCount: 0,
      status: 500,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
