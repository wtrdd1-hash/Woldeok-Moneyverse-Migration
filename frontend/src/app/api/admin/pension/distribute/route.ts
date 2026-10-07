import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function POST() {
  try {
    const data = await api('/api/v1/admin/pension/distribute-payouts', {
      method: 'POST',
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '국민연금 일괄 지급 집행에 실패했습니다.' },
      { status: error?.status || 500 },
    );
  }
}
