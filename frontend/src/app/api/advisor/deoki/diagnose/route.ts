import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' };

export async function GET(): Promise<NextResponse> {
  try {
    const result = await api<{ success?: boolean; diagnosis?: unknown }>('/api/v1/advisor/deoki/diagnose');
    if (result?.success !== true || !result.diagnosis || typeof result.diagnosis !== 'object') {
      return NextResponse.json({ ok: false, error: 'advisor_source_unverified' }, { status: 503, headers: PRIVATE_HEADERS });
    }
    return NextResponse.json(result, { headers: PRIVATE_HEADERS });
  } catch (error: unknown) {
    const status = typeof error === 'object' && error !== null && 'status' in error &&
      [401, 403, 428, 429].includes(Number(error.status)) ? Number(error.status) : 503;
    return NextResponse.json({ ok: false, error: 'advisor_source_unavailable' }, { status, headers: PRIVATE_HEADERS });
  }
}
