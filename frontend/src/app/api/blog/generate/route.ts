import { NextResponse } from 'next/server';
import { currentViewer, isAdministrator } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

/**
 * v716 publication safety gate. Legacy generator embeds unsourced backtest,
 * market-rate, performance and view-count claims. It must never publish until
 * an authenticated editorial approval + source/as-of contract is implemented.
 * There is deliberately no environment toggle to bypass this hold.
 */
export async function POST(req: Request) {
  const internalSecret = process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET;
  const presented = req.headers.get('x-cron-secret')
    || req.headers.get('x-internal-secret')
    || req.headers.get('authorization')?.replace(/^Bearer /, '');
  const machineAuthorized = Boolean(internalSecret && presented && presented === internalSecret);
  const authorized = machineAuthorized || isAdministrator(await currentViewer());

  if (!authorized) {
    return NextResponse.json(
      { success: false, code: 'BLOG_PUBLISH_FORBIDDEN', message: 'Administrator or authorized scheduler required' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  return NextResponse.json(
    {
      success: false,
      code: 'EDITORIAL_REVIEW_REQUIRED',
      message: 'Automatic financial article publishing is paused until sources, market data, editorial review and duplicate checks are verified.',
    },
    { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '3600' } },
  );
}
