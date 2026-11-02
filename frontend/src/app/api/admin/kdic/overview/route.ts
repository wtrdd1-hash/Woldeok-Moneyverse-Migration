import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';
import { parseKdicOverview } from '@/app/admin/kdic/kdic-evidence';

const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' };

export async function GET() {
  try {
    const verified = parseKdicOverview(await api<unknown>('/api/v1/admin/kdic/overview'));
    if (!verified) throw new Error('Unverified KDIC response');
    return NextResponse.json({ success: true, data: verified }, { headers });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return NextResponse.json({
        success: false,
        code: error.status === 401 ? 'AUTHENTICATION_REQUIRED' : 'AUTHORIZATION_DENIED',
      }, { status: error.status, headers });
    }
    return NextResponse.json({ success: false, error: 'KDIC 관제 정보를 검증할 수 없습니다.' }, {
      status: 503, headers,
    });
  }
}
