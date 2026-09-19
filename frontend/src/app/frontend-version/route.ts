import { NextResponse } from 'next/server';

/**
 * Which frontend build is answering right now.
 *
 * This route deliberately lives outside `/api`: production Nginx owns
 * `/api/version` as the backend runtime identity. Comparing that backend SHA
 * with `NEXT_PUBLIC_BUILD_ID` would mark every browser tab stale forever.
 *
 * The stale-tab detector needs a frontend-owned, uncached identity endpoint.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(
    { id: process.env.NEXT_PUBLIC_BUILD_ID ?? 'unknown' },
    { headers: { 'cache-control': 'no-store' } },
  );
}
