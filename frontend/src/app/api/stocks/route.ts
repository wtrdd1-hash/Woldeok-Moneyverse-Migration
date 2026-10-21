import { NextResponse } from 'next/server';
import { apiOrNull } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const data = await apiOrNull<unknown>('/api/v1/stocks');
  if (!data) {
    return NextResponse.json(
      { stocks: [] },
      { status: 200, headers: { 'cache-control': 'public, max-age=5, s-maxage=10' } },
    );
  }
  return NextResponse.json(data, {
    headers: { 'cache-control': 'public, max-age=5, s-maxage=10' },
  });
}
