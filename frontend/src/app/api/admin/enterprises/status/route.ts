import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { code, status, dividendRateBps } = body;
    if (!code || !status) {
      return NextResponse.json({ error: 'code와 status는 필수값입니다.' }, { status: 400 });
    }

    const data = await api(`/api/v1/admin/enterprises/soes/${encodeURIComponent(code)}`, {
      method: 'PUT',
      body: { status, dividendRateBps },
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '공기업 상태 변경에 실패했습니다.' },
      { status: error?.status || 500 },
    );
  }
}
