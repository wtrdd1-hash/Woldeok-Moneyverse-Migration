import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function POST() {
  try {
    const data = await api('/api/v1/pension/toggle-retire', {
      method: 'POST',
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '은퇴 연금 상태 전환에 실패했습니다.' },
      { status: error?.status || 500 },
    );
  }
}
