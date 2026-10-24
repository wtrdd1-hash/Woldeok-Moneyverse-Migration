import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { enterpriseMutationCsrf } from '../mutation-security';

export async function PUT(req: Request) {
  try {
    const csrfToken = await enterpriseMutationCsrf(req);
    if (typeof csrfToken !== 'string') return csrfToken;
    const body = await req.json();
    const { code, status, dividendRateBps } = body;
    if (!code || !status) {
      return NextResponse.json({ error: 'code와 status는 필수값입니다.' }, { status: 400 });
    }

    const data = await api<{ success?: boolean; code?: string; status?: string }>(`/api/v1/admin/enterprises/soes/${encodeURIComponent(code)}`, {
      method: 'PUT',
      body: { status, dividendRateBps },
      csrfToken,
    });
    if (!data || data.success !== true || data.code !== code || data.status !== status) {
      return NextResponse.json({ error: 'unverified enterprise status response' }, { status: 502 });
    }
    return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '공기업 상태 변경에 실패했습니다.' },
      { status: error?.status || 500 },
    );
  }
}
