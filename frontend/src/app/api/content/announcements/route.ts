import { NextResponse } from 'next/server';
import { apiOrNull } from '@/lib/api';
import { verifiedPublishedAnnouncements } from '@/lib/pinned-announcement-evidence';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  const params = new URL(request.url).searchParams;
  const pinnedValues = params.getAll('pinned');
  if (
    [...params.keys()].some((key) => key !== 'pinned') ||
    pinnedValues.length > 1 ||
    (pinnedValues.length === 1 && !['true', 'false'].includes(pinnedValues[0]!))
  ) {
    return NextResponse.json(
      { error: 'invalid pinned announcement filter' },
      { status: 400, headers: { 'cache-control': 'no-store' } },
    );
  }
  const pinnedOnly = pinnedValues[0] === 'true';
  const suffix = pinnedValues.length ? `?pinned=${pinnedValues[0]}` : '';
  const data = await apiOrNull<unknown>(`/api/v1/content/announcements${suffix}`);
  if (!verifiedPublishedAnnouncements(data, pinnedOnly)) {
    return NextResponse.json(
      { error: 'published announcements unavailable' },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    );
  }
  return NextResponse.json(data, {
    headers: {
      'cache-control': 'public, max-age=60',
      ...(pinnedValues.length ? { 'x-robots-tag': 'noindex' } : {}),
    },
  });
}
