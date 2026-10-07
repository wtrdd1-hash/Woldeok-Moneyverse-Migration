import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function GET() {
  try {
    const [overview, bonds, couponLogs] = await Promise.all([
      api('/api/v1/admin/bonds/overview'),
      api('/api/v1/admin/bonds/list'),
      api('/api/v1/admin/bonds/coupon-logs?limit=30'),
    ]);
    return NextResponse.json({ overview, bonds, couponLogs });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '국채 관제 데이터를 불러오는데 실패했습니다.' },
      { status: error?.status || 500 },
    );
  }
}
