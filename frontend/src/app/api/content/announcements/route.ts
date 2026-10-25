import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

const HEADERS = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
};

export async function GET(): Promise<NextResponse> {
  try {
    const data = await api<unknown>('/api/v1/content/announcements');
    if (!data || typeof data !== 'object' || !('announcements' in data) ||
        !Array.isArray(data.announcements)) {
      throw new Error('Invalid published announcements contract');
    }
    return NextResponse.json(data, { headers: HEADERS });
  } catch {
    // A missing DB response is not a successful empty feed.
    return NextResponse.json(
      { error: 'Published announcements unavailable' },
      { status: 503, headers: HEADERS },
    );
  }
}
