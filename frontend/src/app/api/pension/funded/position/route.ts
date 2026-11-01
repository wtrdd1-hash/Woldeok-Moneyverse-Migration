import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
export const dynamic = 'force-dynamic';
const headers = { 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex' };
export async function GET() {
  try {
    const result = await api('/api/v1/pension/funded/position');
    return NextResponse.json(result, { headers });
  } catch {
    return NextResponse.json(
      { code: 'FUNDED_TREASURY_CORE_UNVERIFIED', error: '정식 연금 에스크로 검증을 완료하지 못했습니다.' },
      { status: 503, headers },
    );
  }
}
