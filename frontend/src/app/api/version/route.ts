import { NextResponse } from 'next/server';

/**
 * Which build is answering right now.
 *
 * It lives at /api/version rather than /api/build because the repository's
 * `.gitignore` has `build/` in it: the first version of this file was written,
 * committed, deployed and served a 404, because git had quietly never taken
 * it.
 *
 * The only thing a stale tab needs to learn. It is deliberately tiny and
 * uncached: a page that asks this question and gets a cached answer has not
 * asked it.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(
    { id: process.env.NEXT_PUBLIC_BUILD_ID ?? 'unknown' },
    { headers: { 'cache-control': 'no-store' } },
  );
}
