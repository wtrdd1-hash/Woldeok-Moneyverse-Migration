import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await api('/api/v1/bonds/repo-loans/repay', {
      method: 'POST',
      body,
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '국채 담보 대출 상환에 실패했습니다.' },
      { status: error?.status || 500 },
    );
  }
}
