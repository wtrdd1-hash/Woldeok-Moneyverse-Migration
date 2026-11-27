import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

const HEADERS = { 'Cache-Control': 'private, no-store' };

/**
 * This session's step-up state as the API reports it (GET /api/v1/admin/security,
 * reauthentication.fresh / freshUntil). Anything unreadable answers 503, never "fresh".
 */
export async function GET() {
  try {
    const overview = await api<{ reauthentication?: { fresh?: unknown; freshUntil?: unknown } }>('/api/v1/admin/security');
    const reauth = overview?.reauthentication;
    const freshUntil = typeof reauth?.freshUntil === 'string' ? reauth.freshUntil : null;
    return NextResponse.json({ fresh: reauth?.fresh === true && freshUntil !== null, freshUntil }, { headers: HEADERS });
  } catch {
    return NextResponse.json({ fresh: false, freshUntil: null }, { status: 503, headers: HEADERS });
  }
}
