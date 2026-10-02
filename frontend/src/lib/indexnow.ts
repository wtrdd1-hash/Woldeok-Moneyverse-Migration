/**
 * IndexNow Protocol Real-time Search Engine Submission Engine
 * Supports: Bing, Naver, Yandex, Seznam
 */

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
 * Submits a batch of URLs (up to 10,000) to IndexNow API.
 */
export async function submitToIndexNow(urls: readonly string[]): Promise<IndexNowResult> {
  if (urls.length === 0) {
    return { success: true, submittedCount: 0, status: 200 };
  }

  const payload: IndexNowPayload = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: urls.slice(0, 10000),
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
