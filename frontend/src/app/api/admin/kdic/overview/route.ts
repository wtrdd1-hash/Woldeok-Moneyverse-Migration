import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { parseKdicOverview } from '@/app/admin/kdic/kdic-evidence';

export async function GET() {
  try {
    const verified = parseKdicOverview(await api<unknown>('/api/v1/admin/kdic/overview'));
    if (!verified) throw new Error('Unverified KDIC response');
    return NextResponse.json({ success: true, data: verified }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'KDIC 관제 정보를 검증할 수 없습니다.' }, {
      status: 503, headers: { 'Cache-Control': 'private, no-store' },
    });
  }
}
