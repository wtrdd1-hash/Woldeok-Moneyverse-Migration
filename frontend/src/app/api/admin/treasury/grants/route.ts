import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';
import type { AdminConsole } from '@/app/admin/types';

export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'private, no-store' };

async function denyUnlessOpenAdminConsole(): Promise<NextResponse | null> {
  try {
    const admin = await api<AdminConsole>('/api/v1/admin/security');
    if (admin.consoleSession.state !== 'open') {
      return NextResponse.json(
        { ok: false, message: '관리자 재인증이 필요한 화면입니다.' },
        { status: 403, headers: noStore },
      );
    }
    return null;
  } catch (error) {
    const status =
      error instanceof ApiError && (error.status === 401 || error.status === 403)
        ? error.status
        : 503;
    return NextResponse.json(
      { ok: false, message: status === 503 ? '관리자 인증 서비스가 이용 불가합니다.' : '접근 권한이 없습니다.' },
      { status, headers: noStore },
    );
  }
}

export async function GET() {
  const denied = await denyUnlessOpenAdminConsole();
  if (denied) return denied;

  try {
    const data = await api<{ ok: boolean; applications: any[] }>('/api/v1/admin/treasury/grants');
    return NextResponse.json({ ok: true, applications: data.applications ?? [] }, { headers: noStore });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '지원금 목록을 조회할 수 없습니다.';
    return NextResponse.json({ ok: false, message: msg, applications: [] }, { status: 500, headers: noStore });
  }
}

export async function POST(request: Request) {
  const denied = await denyUnlessOpenAdminConsole();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { applicationId, action, amountWld, vaultCode, reviewNote } = body;

    if (!applicationId || !action) {
      return NextResponse.json(
        { ok: false, message: 'applicationId 및 action 필드가 필요합니다.' },
        { status: 400, headers: noStore },
      );
    }

    const res = await api<{ ok: boolean; message: string; result: any }>(
      `/api/v1/admin/treasury/grants/${encodeURIComponent(applicationId)}/review`,
      {
        method: 'POST',
        body: JSON.stringify({ action, amountWld, vaultCode, reviewNote }),
      },
    );

    return NextResponse.json(res, { headers: noStore });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '심사 처리에 실패했습니다.';
    return NextResponse.json({ ok: false, message: msg }, { status: 500, headers: noStore });
  }
}
