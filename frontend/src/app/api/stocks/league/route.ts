import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

const privateHeaders = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};

export async function GET(): Promise<NextResponse> {
  try {
    const result = await api<Record<string, unknown>>('/api/v1/stocks/league/current', { method: 'GET' });
    return NextResponse.json(result, { headers: privateHeaders });
  } catch (error: unknown) {
    const status = typeof error === 'object' && error !== null && 'status' in error && typeof error.status === 'number' && error.status >= 400 && error.status <= 599 ? error.status : 503;
    return NextResponse.json({ error: '주식 챔피언십 리그 정보를 검증할 수 없습니다.' }, { status, headers: privateHeaders });
  }
}
