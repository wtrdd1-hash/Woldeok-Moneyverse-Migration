import { NextResponse } from 'next/server';
import { apiOrNull } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const data = await apiOrNull<unknown>('/api/v1/seo/metadata');
  if (!data) {
    return NextResponse.json(
      { siteName: '월덕 머니버스', origin: 'https://easy-scraping.com' },
      { status: 200, headers: { 'cache-control': 'public, max-age=3600' } },
    );
  }
  return NextResponse.json(data, {
    headers: { 'cache-control': 'public, max-age=3600' },
  });
}
