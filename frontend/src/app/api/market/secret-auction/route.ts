import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  try {
    const result = await api<Record<string, unknown>>('/api/v1/market/secret-auction/active', {
      method: 'GET',
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '비밀 암시장 경매 목록을 불러오지 못했습니다.' },
      { status: error?.status || 400 },
    );
  }
}
