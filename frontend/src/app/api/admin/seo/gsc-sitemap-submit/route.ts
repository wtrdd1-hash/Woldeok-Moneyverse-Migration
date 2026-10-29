import { ApiError } from '@/lib/api';
import { mutate } from '@/lib/mutate';
import { seoResponse, verifySeoOperator, verifySeoWriteOrigin } from '@/lib/admin-seo-authority';

export const dynamic = 'force-dynamic';

function allowedSitemapUrl(input: unknown): string | null {
  if (typeof input !== 'string' || input.length > 512) return null;
  try {
    const parsed = new URL(input);
    const allowedOrigin = new URL(process.env.APP_BASE_URL || 'https://easy-scraping.com');
    if (
      parsed.origin !== allowedOrigin.origin ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash
    )
      return null;
    if (!/^\/sitemap[a-zA-Z0-9_-]*\.xml$/i.test(parsed.pathname)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

type VerifiedGscReceipt = {
  readonly sitemapUrl: string;
  readonly propertyUrl: string;
  readonly message: string | null;
  readonly directConsoleUrl: string | null;
};

/** A successful backend flag alone cannot prove which sitemap Google accepted. */
function verifiedGscReceipt(input: unknown, requestedSitemap: string): VerifiedGscReceipt | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const receipt = input as Record<string, unknown>;
  if (receipt.success !== true || receipt.sitemapUrl !== requestedSitemap) return null;

  const site = new URL(requestedSitemap);
  const property = receipt.propertyUrl;
  if (typeof property !== 'string' || property.length > 512) return null;
  if (property !== `sc-domain:${site.hostname}`) {
    try {
      const prefix = new URL(property);
      if (prefix.origin !== site.origin || prefix.pathname !== '/' ||
          prefix.username || prefix.password || prefix.search || prefix.hash) return null;
    } catch {
      return null;
    }
  }

  const consoleUrl = receipt.directConsoleUrl;
  if (consoleUrl !== undefined && consoleUrl !== null) {
    if (typeof consoleUrl !== 'string' || consoleUrl.length > 1024) return null;
    try {
      const url = new URL(consoleUrl);
      const params = [...url.searchParams.keys()];
      if (url.origin !== 'https://search.google.com' ||
          url.pathname !== '/search-console/sitemaps' ||
          url.username || url.password || url.hash ||
          params.some((key) => key !== 'resource_id') ||
          (url.searchParams.has('resource_id') &&
           (params.length !== 1 || url.searchParams.get('resource_id') !== property))) return null;
    } catch {
      return null;
    }
  }

  return {
    sitemapUrl: requestedSitemap,
    propertyUrl: property,
    directConsoleUrl: typeof consoleUrl === 'string' ? consoleUrl : null,
    message: typeof receipt.message === 'string' && receipt.message.length <= 500
      ? receipt.message : null,
  };
}

/** Delegate the actual GSC submission to the authenticated+CSRF-protected Nest endpoint. */
export async function POST(req: Request) {
  const wrongOrigin = verifySeoWriteOrigin(req);
  if (wrongOrigin) return wrongOrigin;
  const denied = await verifySeoOperator();
  if (denied) return denied;

  const data = (await req.json().catch(() => null)) as { sitemapUrl?: unknown } | null;
  const defaultUrl = `${(process.env.APP_BASE_URL || 'https://easy-scraping.com').replace(/\/$/, '')}/sitemap.xml`;
  const sitemapUrl = allowedSitemapUrl(data?.sitemapUrl ?? defaultUrl);
  if (!sitemapUrl) return seoResponse({ success: false, error: 'invalid_sitemap_url' }, 400);

  try {
    const receipt = await mutate<{
      success?: boolean;
      message?: string;
      directConsoleUrl?: string;
      sitemapUrl?: string;
      propertyUrl?: string;
    }>('/api/v1/seo/gsc/submit-sitemap', { body: { sitemapUrl } });
    const verified = verifiedGscReceipt(receipt, sitemapUrl);
    if (!verified) {
      return seoResponse(
        { success: false, error: 'gsc_not_confirmed', indexingConfirmed: false },
        502,
      );
    }
    return seoResponse({
      success: true,
      isGscSubmitted: true,
      indexingConfirmed: false,
      gscMessage:
        verified.message ||
        'Google Search Console가 사이트맵 제출 요청을 접수했습니다. 검색 색인은 별도 확인이 필요합니다.',
      directConsoleUrl: verified.directConsoleUrl,
      sitemapUrl,
      propertyUrl: verified.propertyUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const status =
      error instanceof ApiError
        ? error.status === 401
          ? 401
          : [403, 428].includes(error.status)
            ? 403
            : error.status === 429
              ? 429
              : error.status === 400
                ? 400
                : 503
        : 503;
    return seoResponse(
      { success: false, error: 'gsc_submit_unavailable', indexingConfirmed: false },
      status,
    );
  }
}
