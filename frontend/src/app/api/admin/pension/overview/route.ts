import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function GET() {
  try {
    const data = await api('/api/v1/admin/pension/overview');
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '국민연금 관리자 개요 조회에 실패했습니다.' },
      { status: error?.status || 500 },
    );
  }
}
