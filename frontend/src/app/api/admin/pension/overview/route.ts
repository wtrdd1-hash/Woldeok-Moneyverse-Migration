import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function GET() {
  try {
    const data = await api('/api/v1/admin/pension/overview');
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: unknown) {
    const status = typeof error === 'object' && error !== null && 'status' in error &&
      typeof error.status === 'number' && error.status >= 400 && error.status < 600
      ? error.status : 503;
    return NextResponse.json(
      { error: '연금 관리자 개요를 확인할 수 없습니다.' },
      { status, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
