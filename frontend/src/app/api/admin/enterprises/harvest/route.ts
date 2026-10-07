import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function POST() {
  try {
    const data = await api('/api/v1/admin/enterprises/soes/harvest', {
      method: 'POST',
      body: {},
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '공기업 배당금 국고 수취 요청에 실패했습니다.' },
      { status: error?.status || 500 },
    );
  }
}
