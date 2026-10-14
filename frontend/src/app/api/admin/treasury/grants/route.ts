import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';
import type { AdminConsole } from '@/app/admin/types';
import { loadGrants } from '@/app/api/treasury/apply-grant/route';

export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'private, no-store' };

// Authenticated membership is insufficient: the backend enforces the actual
// admin role, and the elevated console must also be open before any read.
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
  // Never seed fabricated applications, and never write state in GET.
  return NextResponse.json({ ok: true, applications: loadGrants() }, { headers: noStore });
}

export async function POST(_request: Request) {
  const denied = await denyUnlessOpenAdminConsole();
  if (denied) return denied;
  // Fail closed until an authorized ledger-backed atomic grant decision exists.
  return NextResponse.json(
    { ok: false, message: '국고 그랜트 지급/심사는 원장 정산과 감사 기록이 검증될 때까지 일시 중단되었습니다.' },
    { status: 503, headers: noStore },
  );
}
