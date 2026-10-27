import { NextResponse } from 'next/server';
import { currentViewer, isAdministrator } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'no-store' } as const;

export async function GET(_req: Request) {
  const viewer = await currentViewer();
  if (!isAdministrator(viewer)) {
    return NextResponse.json(
      { success: false, code: 'FORBIDDEN', message: 'Administrator required' },
      { status: 403, headers },
    );
  }
  return NextResponse.json(
    {
      success: true,
      status: 'EDITORIAL_HOLD',
      publicationEnabled: false,
      engine: 'AI Financial & Tech Multi-Country Editorial Engine v2026',
      supportedCountries: ['KR', 'US', 'JP', 'VN'],
      supportedCategories: ['WEALTH', 'COMPOUND', 'STOCKS', 'TAX', 'MACRO', 'TECH'],
      message: 'Automatic publication is held pending verified editorial review and approval.',
    },
    { status: 200, headers },
  );
}

export async function POST(req: Request) {
  const configuredSecret = process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET;
  const presented = req.headers.get('x-cron-secret')
    || req.headers.get('x-internal-secret')
    || req.headers.get('authorization')?.replace(/^Bearer /, '');

  let isAuthorized = false;

  // 1. Cron or internal scheduler credential check
  if (configuredSecret && presented && presented === configuredSecret) {
    isAuthorized = true;
  }

  // 2. Administrator session check if not authenticated via scheduler secret
  if (!isAuthorized) {
    const viewer = await currentViewer();
    if (isAdministrator(viewer)) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return NextResponse.json(
      { success: false, code: 'BLOG_PUBLISH_FORBIDDEN', message: 'Administrator or valid scheduler secret required' },
      { status: 403, headers },
    );
  }

  // No durable, auditable editorial approval exists for generated articles.
  // Keep both scheduler and administrator publication closed until that contract
  // is implemented; credentials alone are not editorial evidence.
  return NextResponse.json(
    {
      success: false,
      code: 'EDITORIAL_REVIEW_REQUIRED',
      message: 'Automatic publication is disabled pending verified editorial approval.',
    },
    { status: 503, headers },
  );
}
