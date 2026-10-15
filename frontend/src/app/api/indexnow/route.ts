import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ApiError, api } from '@/lib/api';
import { submitToIndexNow, INDEXNOW_HOST } from '@/lib/indexnow';
import { ALL_PSEO_POPULAR_SLUGS } from '@/config/pseo-stocks.config';
import { ALL_SEO_PRESETS } from '@/config/seo-presets.config';
import { getPublicSitemapRoutes } from '@/config/routes.config';

export const dynamic = 'force-dynamic';
const HEADERS = { 'cache-control': 'private, no-store' };
const reply = (value: unknown, status: number) => NextResponse.json(value, { status, headers: HEADERS });

function verifiedUrls(urls: unknown): string[] | null {
  if (!Array.isArray(urls) || urls.length === 0 || urls.length > 100) return null;
  const validated: string[] = [];
  for (const candidate of urls) {
    if (typeof candidate !== 'string' || candidate.length > 2048) return null;
    try {
      const parsed = new URL(candidate);
      if (
        parsed.protocol !== 'https:' || parsed.hostname !== INDEXNOW_HOST ||
        parsed.port !== '' || parsed.username || parsed.password || parsed.hash
      ) return null;
      validated.push(parsed.href);
    } catch {
      return null;
    }
  }
  return [...new Set(validated)];
}

export async function POST(req: NextRequest) {
  // Browser POSTs must originate on this exact host. A bare HTTP/curl POST
  // or a cross-site form never gets permission to initiate a submission.
  const origin = req.headers.get('origin');
  const site = req.headers.get('sec-fetch-site');
  if (!origin || origin !== new URL(req.url).origin || (site && site !== 'same-origin')) {
    return reply({ ok: false, error: 'cross_origin_forbidden' }, 403);
  }

  try {
    const security = await api<{ consoleSession: { state: string } }>('/api/v1/admin/security');
    if (security.consoleSession?.state !== 'open') return reply({ ok: false, error: 'admin_console_locked' }, 403);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return reply({ ok: false, error: 'login_required' }, 401);
    if (error instanceof ApiError && [403, 428].includes(error.status)) return reply({ ok: false, error: 'forbidden' }, 403);
    return reply({ ok: false, error: 'admin_authority_unavailable' }, 503);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return reply({ ok: false, error: 'invalid_request_json' }, 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return reply({ ok: false, error: 'invalid_request_body' }, 400);
  }
  const supplied = (body as { urls?: unknown }).urls;
  let targetUrls: string[];
  if (supplied !== undefined) {
    const validated = verifiedUrls(supplied);
    if (!validated) return reply({ ok: false, error: 'invalid_owned_urls' }, 400);
    targetUrls = validated;
  } else {
    const base = 'https://' + INDEXNOW_HOST;
    const staticUrls = getPublicSitemapRoutes()
      .filter((r) => !r.path.includes('['))
      .map((r) => base + (r.path === '/' ? '' : r.path));
    const presetUrls = ALL_SEO_PRESETS.map((p) => base + '/tools/' + p.category + '-calculator/' + p.slug);
    const pseoUrls = ALL_PSEO_POPULAR_SLUGS.map((slug) => base + '/tools/stock-calculator/' + slug);
    targetUrls = [...staticUrls, ...presetUrls, ...pseoUrls];
  }

  try {
    const result = await submitToIndexNow(targetUrls);
    if (!result.success) return reply({
      ok: false, error: 'indexnow_submission_failed', submittedCount: result.submittedCount,
      upstreamStatus: result.status, indexingConfirmed: false,
    }, 502);
    return reply({
      ok: true, submittedCount: result.submittedCount, status: result.status, indexingConfirmed: false,
    }, result.status === 202 ? 202 : 200);
  } catch {
    return reply({ ok: false, error: 'indexnow_unavailable', indexingConfirmed: false }, 502);
  }
}

export async function GET() {
  return reply({
    service: 'Moneyverse IndexNow Gateway', host: INDEXNOW_HOST,
    totalPseoUrls: ALL_PSEO_POPULAR_SLUGS.length, status: 'configured',
  }, 200);
}
