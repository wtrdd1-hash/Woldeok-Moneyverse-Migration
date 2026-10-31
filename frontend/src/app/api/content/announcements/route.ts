import { NextResponse } from 'next/server';
import { apiOrNull } from '@/lib/api';
import { parsePublicAnnouncements } from '@/lib/announcement-feed';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  // This is the actual Nest route, backed by content_list_published_announcements.
  const evidence = parsePublicAnnouncements(await apiOrNull<unknown>('/api/v1/announcements'));
  if (evidence === null) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Service Unavailable', status: 503,
        code: 'announcements_unverified', detail: 'Published announcements are unavailable' },
      { status: 503, headers: {
        'cache-control': 'no-store', 'x-robots-tag': 'noindex',
        'content-type': 'application/problem+json',
      } },
    );
  }
  return NextResponse.json(evidence, {
    headers: { 'cache-control': 'public, max-age=60', 'x-robots-tag': 'noindex' },
  });
}
