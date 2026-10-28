export interface IndexNowSubmissionEvidence {
  readonly success: boolean;
  readonly acceptedEndpoints: number;
  readonly totalEndpoints: number;
  readonly submittedUrls: readonly string[];
  readonly timestamp: string;
  readonly indexingConfirmed: false;
}

const PROVIDERS = new Set([
  'https://api.indexnow.org/indexnow',
  'https://searchadvisor.naver.com/indexnow',
  'https://www.bing.com/indexnow',
]);

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** An HTTP 200 from our API does not prove any search engine received the notification. */
export function parseIndexNowSubmissionReceipt(
  raw: unknown,
  expectedOrigin?: string,
  nowMs = Date.now(),
): IndexNowSubmissionEvidence | null {
  if (!record(raw) || typeof raw.success !== 'boolean' || raw.googlePingStatus !== 410) return null;
  if (typeof raw.timestamp !== 'string') return null;
  const at = Date.parse(raw.timestamp);
  if (!Number.isFinite(at) || at > nowMs + 60_000 || nowMs - at > 10 * 60_000) return null;
  if (!Array.isArray(raw.submittedUrls) || raw.submittedUrls.length < 1 || raw.submittedUrls.length > 100) return null;
  if (!Array.isArray(raw.indexNowResponses) || raw.indexNowResponses.length !== PROVIDERS.size) return null;

  let origin: string | null = null;
  try {
    origin = expectedOrigin ? new URL(expectedOrigin).origin : null;
    const urls = new Set<string>();
    for (const item of raw.submittedUrls) {
      if (typeof item !== 'string' || item.length > 2048) return null;
      const url = new URL(item);
      if (url.protocol !== 'https:' || url.username || url.password || url.hash || !url.pathname.startsWith('/')) return null;
      if (origin !== null && url.origin !== origin) return null;
      origin ??= url.origin;
      if (url.origin !== origin || urls.has(url.href)) return null;
      urls.add(url.href);
    }
  } catch {
    return null;
  }

  const seen = new Set<string>();
  let accepted = 0;
  for (const item of raw.indexNowResponses) {
    if (!record(item) || typeof item.endpoint !== 'string' || !PROVIDERS.has(item.endpoint)
      || seen.has(item.endpoint) || !Number.isInteger(item.status) || (item.status as number) < 100
      || (item.status as number) > 599 || typeof item.message !== 'string'
      || item.message.length < 1 || item.message.length > 500) return null;
    seen.add(item.endpoint);
    if (item.status === 200 || item.status === 202) accepted++;
  }
  if (seen.size !== PROVIDERS.size || raw.success !== (accepted > 0)) return null;
  return {
    success: raw.success,
    acceptedEndpoints: accepted,
    totalEndpoints: PROVIDERS.size,
    submittedUrls: raw.submittedUrls as string[],
    timestamp: raw.timestamp,
    indexingConfirmed: false,
  };
}
