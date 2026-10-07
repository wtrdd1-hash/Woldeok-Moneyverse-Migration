import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await api('/api/v1/pension/contribute', {
      method: 'POST',
      body,
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '국민연금 기여금 납입에 실패했습니다.' },
      { status: error?.status || 500 },
    );
  }
}
