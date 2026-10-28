import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { parsePensionPayoutLogs } from '@/app/admin/pension/pension-evidence';

export async function GET() {
  try {
    const raw = await api<unknown>('/api/v1/admin/pension/recent-payouts?limit=30');
    const data = parsePensionPayoutLogs(raw);
    if (data === null) throw new Error('invalid pension evidence');
    return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error: unknown) {
    const status = typeof error === 'object' && error !== null && 'status' in error &&
      typeof error.status === 'number' && error.status >= 400 && error.status < 600
      ? error.status : 503;
    return NextResponse.json(
      { error: '연금 지급 기록을 확인할 수 없습니다.' },
      { status, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }
}
