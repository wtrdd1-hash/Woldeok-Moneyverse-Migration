import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await api('/api/v1/bonds/subscribe', {
      method: 'POST',
      body,
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '국채 청약 신청에 실패했습니다.' },
      { status: error?.status || 500 },
    );
  }
}
