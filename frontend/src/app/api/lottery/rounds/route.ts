import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  try {
    const rounds = await api<unknown>('/api/v1/lottery/rounds');
    return NextResponse.json(rounds, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ code: 'lottery_rounds_unavailable' }, {
      status: 503,
      headers: { 'cache-control': 'no-store' },
    });
  }
}
