import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';
import type { AdminConsole } from '@/app/admin/types';
import { loadGrants } from '@/lib/treasury-grants-legacy';

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
    if (data && Array.isArray(data.applications) && data.applications.length > 0) {
      return NextResponse.json({ ok: true, applications: data.applications }, { headers: noStore });
    }
  } catch {
    // fallback
  }
  return NextResponse.json({ ok: true, applications: loadGrants() }, { headers: noStore });
}

export async function POST(request: Request) {
  const denied = await denyUnlessOpenAdminConsole();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { applicationId, action, approvedAmountWld, fundingVault, reviewNote } = body;

    if (!applicationId || !action) {
      return NextResponse.json(
        { ok: false, message: '신청서 ID와 심사 액션(APPROVE/REJECT)이 필요합니다.' },
        { status: 400, headers: noStore },
      );
    }

    const res = await api<{ ok: boolean; message: string; result: any }>(
      `/api/v1/admin/treasury/grants/${encodeURIComponent(applicationId)}/review`,
      {
        method: 'POST',
        body: JSON.stringify({
          action,
          amountWld: approvedAmountWld ? String(approvedAmountWld) : undefined,
          vaultCode: fundingVault || 'VAULT_WELFARE',
          reviewNote,
        }),
      },
    );

    return NextResponse.json(res, { headers: noStore });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '창업 지원금 심사 처리 중 오류가 발생했습니다.';
    return NextResponse.json({ ok: false, message: msg }, { status: 500, headers: noStore });
  }
}
