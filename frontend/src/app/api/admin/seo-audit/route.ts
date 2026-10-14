import { NextResponse } from 'next/server';
import { ApiError, api } from '@/lib/api';
import { getAllPublicUrlsForIndexNow, submitToIndexNow } from '@/lib/indexnow';

export const dynamic = 'force-dynamic';

const reply = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });

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
  let telemetry: unknown = null;
  try { telemetry = await api('/api/v1/seo/status'); } catch { /* unknown, not healthy */ }
  return reply({
    timestamp: new Date().toISOString(),
    candidateUrlCount: getAllPublicUrlsForIndexNow().length,
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
  try {
    const result = await submitToIndexNow();
    if (!result.success) return reply({
      ok: false, error: 'indexnow_submission_failed',
      submittedCount: result.submittedCount,
      upstreamStatus: result.status,
      indexingConfirmed: false,
    }, 502);
    return reply({
      ok: true, submittedCount: result.submittedCount, status: result.status,
      indexingConfirmed: false, timestamp: new Date().toISOString(),
    }, result.status === 202 ? 202 : 200);
  } catch {
    return reply({ ok: false, error: 'indexnow_unavailable', indexingConfirmed: false }, 502);
  }
}
