import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';
import { mutate } from '@/lib/mutate';

export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' };
const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers });
const presets = new Set(['default', 'whale', 'jackpot', 'treasury', 'killswitch', 'bank_delinquency']);

export async function POST(req: Request) {
  // A browser may have an administrator cookie even when the POST is initiated
  // from another origin. Check the boundary before obtaining a CSRF token.
  const origin = req.headers.get('origin');
  const site = req.headers.get('sec-fetch-site');
  if (!origin || origin !== new URL(req.url).origin || (site && site !== 'same-origin')) {
    return reply({ success: false, error: 'cross_origin_forbidden' }, 403);
  }
  try {
    const security = await api<{ consoleSession?: { state?: string } }>('/api/v1/admin/security');
    if (security.consoleSession?.state !== 'open') {
      return reply({ success: false, error: 'admin_console_required' }, 403);
    }
    const body: unknown = await req.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body) ||
      !('preset' in body) || typeof body.preset !== 'string' || !presets.has(body.preset)) {
      return reply({ success: false, error: 'invalid_test_preset' }, 400);
    }
    // Server-side mutate obtains a token bound to this exact session.
    const result = await mutate<Record<string, unknown>>('/api/v1/admin/discord/test-dm', {
      method: 'POST', body: { preset: body.preset },
    });
    return reply(result);
  } catch (error) {
    const status = error instanceof ApiError && [401, 403].includes(error.status)
      ? error.status : 503;
    return reply({ success: false, error: status === 503 ? 'dm_test_unavailable' : 'admin_authorization_required' }, status);
  }
}
