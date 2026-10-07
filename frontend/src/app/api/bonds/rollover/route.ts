import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { holdingId, enabled } = body;
    const data = await api(`/api/v1/bonds/holdings/${holdingId}/rollover`, {
      method: 'PUT',
      body: { enabled },
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '자동 롤오버 설정 변경에 실패했습니다.' },
      { status: error?.status || 500 },
    );
  }
}
