import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { ApiError, api } from '@/lib/api';
import { getAllPublicUrlsForIndexNow, submitToIndexNow } from '@/lib/indexnow';
import { parseIndexNowCandidateUrls, parseIndexNowReceipt, parseSeoTelemetry } from '@/lib/admin-seo-audit-evidence';

export const dynamic = 'force-dynamic';

const reply = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: {
    'Cache-Control': 'private, no-store',
    'X-Robots-Tag': 'noindex, nofollow',
    'Referrer-Policy': 'no-referrer',
  } });

const candidates = () => parseIndexNowCandidateUrls(getAllPublicUrlsForIndexNow());
const digestOf = (urls: readonly string[]) =>
  createHash('sha256').update(JSON.stringify(urls)).digest('hex');

async function authorize(): Promise<NextResponse | null> {
  try {
    const security = await api<{ consoleSession: { state: string } }>('/api/v1/admin/security');
    if (security.consoleSession?.state !== 'open') return reply({ error: 'console_locked' }, 403);
    return null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return reply({ error: 'login_required' }, 401);
    if (error instanceof ApiError && [403, 428].includes(error.status)) return reply({ error: 'forbidden' }, 403);
    return reply({ error: 'authority_unavailable' }, 503);
  }
}

export async function GET() {
  const denied = await authorize();
  if (denied) return denied;
  const urls = candidates();
  if (urls === null) return reply({ error: 'candidate_source_invalid' }, 503);
  let telemetry = null;
  try { telemetry = parseSeoTelemetry(await api('/api/v1/seo/status')); } catch { /* unknown, not healthy */ }
  return reply({
    timestamp: new Date().toISOString(),
    candidateUrlCount: urls.length,
    candidateUrls: urls,
    candidateDigest: digestOf(urls),
    telemetry,
    telemetryStatus: telemetry ? 'observed' : 'unavailable',
    indexingStatus: 'not_measured',
    schemaValidationStatus: 'not_measured',
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const site = request.headers.get('sec-fetch-site');
  if (!origin || origin !== new URL(request.url).origin || (site && site !== 'same-origin')) {
    return reply({ ok: false, error: 'cross_origin_forbidden' }, 403);
  }
  const denied = await authorize();
  if (denied) return denied;
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return reply({ ok: false, error: 'invalid_confirmation' }, 400);
  }
  let confirmation: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 256) return reply({ ok: false, error: 'invalid_confirmation' }, 400);
    confirmation = JSON.parse(raw);
  } catch {
    return reply({ ok: false, error: 'invalid_confirmation' }, 400);
  }
  if (confirmation === null || typeof confirmation !== 'object' || Array.isArray(confirmation)) {
    return reply({ ok: false, error: 'invalid_confirmation' }, 400);
  }
  const body = confirmation as Record<string, unknown>;
  if (typeof body.candidateDigest !== 'string' || !/^[a-f0-9]{64}$/.test(body.candidateDigest) ||
      typeof body.candidateUrlCount !== 'number' || !Number.isSafeInteger(body.candidateUrlCount) ||
      body.candidateUrlCount < 1 || body.candidateUrlCount > 10000) {
    return reply({ ok: false, error: 'invalid_confirmation' }, 400);
  }
  const urls = candidates();
  if (urls === null) return reply({ ok: false, error: 'candidate_source_invalid' }, 503);
  if (urls.length !== body.candidateUrlCount || digestOf(urls) !== body.candidateDigest) {
    return reply({ ok: false, error: 'candidate_source_changed' }, 409);
  }
  try {
    const result = await submitToIndexNow(urls);
    if (!result.success || result.submittedCount !== urls.length) return reply({
      ok: false, error: 'indexnow_submission_failed',
      submittedCount: result.submittedCount,
      upstreamStatus: result.status,
      indexingConfirmed: false,
    }, 502);
    const receipt = parseIndexNowReceipt({
      ok: true, submittedCount: result.submittedCount, status: result.status, indexingConfirmed: false,
    });
    if (!receipt) return reply({ ok: false, error: 'invalid_indexnow_receipt', indexingConfirmed: false }, 502);
    return reply({ ...receipt, timestamp: new Date().toISOString() }, receipt.status);
  } catch {
    return reply({ ok: false, error: 'indexnow_unavailable', indexingConfirmed: false }, 502);
  }
}
