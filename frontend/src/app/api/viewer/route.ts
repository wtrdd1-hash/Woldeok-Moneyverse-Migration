import { NextResponse } from 'next/server';
import { viewerOrUnknown } from '@/lib/viewer';

/**
 * Session state for the navigation, and nothing else.
 *
 * It exists so the rail can know who is reading without the *page* knowing.
 * Reading a cookie during render opts a route out of static generation in
 * Next, and it would do so for every page in the application, because the
 * rail is in the root layout — which would cost the public pages the
 * prerendered HTML a crawler needs and the instant first paint a visitor
 * gets. Fetching it after hydration keeps those pages static.
 *
 * Safe to expose: it reports only what the caller's own cookie already
 * proves, carries no CSRF token and no member identity, and nothing in this
 * application trusts it for access — the API re-decides every permission on
 * every request.
 */
export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const viewer = await viewerOrUnknown();

  // Not knowing is reported as not knowing. Answering `signedIn: false`
  // because the lookup failed would take a member's session away from them on
  // screen while it was still perfectly valid, and the caller keeps whatever
  // it already had when this is not ok.
  if (!viewer) {
    return NextResponse.json(
      { detail: 'viewer unavailable' },
      { status: 503, headers: { 'cache-control': 'private, no-store' } },
    );
  }

  return NextResponse.json(viewer, {
    headers: { 'cache-control': 'private, no-store' },
  });
}
