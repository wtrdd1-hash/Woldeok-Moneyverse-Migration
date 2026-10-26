import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { parseAdminBondTelemetry } from '@/app/admin/bonds/bond-telemetry';

export async function GET() {
  try {
    const [overview, bonds, couponLogs] = await Promise.all([
      api('/api/v1/admin/bonds/overview'),
      api('/api/v1/admin/bonds/list'),
      api('/api/v1/admin/bonds/coupon-logs?limit=30'),
    ]);
    const telemetry = parseAdminBondTelemetry({ overview, bonds, couponLogs });
    if (!telemetry)
      return NextResponse.json({ error: '국채 관제 응답 검증 실패' }, { status: 503 });
    return NextResponse.json(telemetry, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '국채 관제 데이터를 불러오는데 실패했습니다.' },
      { status: error?.status || 500 },
    );
  }
}
