import { NextResponse } from 'next/server';
import { apiOrNull } from '@/lib/api';
import { parseVerifiedAnnouncements } from '@/lib/announcement-source';

export const dynamic = 'force-dynamic';

const headers = {
  'cache-control': 'no-store',
  'x-robots-tag': 'noindex',
  'referrer-policy': 'no-referrer',
};

export async function GET(): Promise<NextResponse> {
  const source = await apiOrNull<unknown>('/api/v1/content/announcements');
  const snapshot = parseVerifiedAnnouncements(source);
  if (!snapshot) {
    return NextResponse.json(
      { sourceStatus: 'UNAVAILABLE', code: 'ANNOUNCEMENTS_UNVERIFIED' },
      { status: 503, headers },
    );
  }
  return NextResponse.json(snapshot, { status: 200, headers });
}
