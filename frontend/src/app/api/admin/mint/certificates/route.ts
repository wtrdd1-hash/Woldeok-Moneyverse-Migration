import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };

export async function GET() {
  try {
    const [mints, retirements] = await Promise.all([
      api<unknown[]>('/api/v1/admin/economy/monetary/certificates/mints?limit=50').catch(() => []),
      api<unknown[]>('/api/v1/admin/economy/monetary/certificates/retirements?limit=50').catch(() => []),
    ]);

    return NextResponse.json({
      source: 'persistent_monetary_policy',
      mints: Array.isArray(mints) ? mints : [],
      retirements: Array.isArray(retirements) ? retirements : [],
    }, { headers });
  } catch (e) {
    const denied = e instanceof ApiError && (e.status === 401 || e.status === 403);
    return NextResponse.json({
      error: '증명서 기록 조회에 실패했습니다.',
      code: denied ? (e.status === 401 ? 'AUTHENTICATION_REQUIRED' : 'AUTHORIZATION_DENIED') : 'CERTIFICATES_UNAVAILABLE',
    }, { status: denied ? e.status : 503, headers });
  }
}
