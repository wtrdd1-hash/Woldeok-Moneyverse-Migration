import { NextResponse } from 'next/server';
import { apiOrNull } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const data = await apiOrNull<unknown>('/api/v1/content/announcements');
  if (!data) {
    return NextResponse.json(
      { announcements: [] },
      { status: 200, headers: { 'cache-control': 'public, max-age=60' } },
    );
  }
  return NextResponse.json(data, {
    headers: { 'cache-control': 'public, max-age=60' },
  });
}
