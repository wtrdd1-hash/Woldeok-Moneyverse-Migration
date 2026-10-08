import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { question } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: '상담 질문을 입력해주세요.' }, { status: 400 });
    }

    const result = await api<Record<string, unknown>>('/api/v1/advisor/deoki/ask', {
      method: 'POST',
      body: { question },
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '덕이와의 상담 연결에 실패했습니다.' },
      { status: error?.status || 400 },
    );
  }
}
