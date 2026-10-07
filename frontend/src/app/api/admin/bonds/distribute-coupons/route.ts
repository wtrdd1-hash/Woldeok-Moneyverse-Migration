import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function POST() {
  try {
    const data = await api('/api/v1/admin/bonds/distribute-coupons', {
      method: 'POST',
      body: {},
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '국채 쿠폰 이자 일괄 지급에 실패했습니다.' },
      { status: error?.status || 500 },
    );
  }
}
