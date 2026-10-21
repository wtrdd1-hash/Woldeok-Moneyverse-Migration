import { NextResponse } from 'next/server';
import { currentViewer, isAdministrator } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'no-store' } as const;

/**
 * The legacy JSON publisher cannot establish a durable editorial approval
 * receipt or idempotent source-verified publication. In particular a cron
 * token, even one supplied through an environment variable, is not approval.
 * Keep the existing material readable while the reviewed publisher is built.
 */
function editorialHold() {
  return NextResponse.json(
    {
      success: false,
      code: 'EDITORIAL_REVIEW_REQUIRED',
      message: 'Publication is suspended pending source verification and editorial approval.',
    },
    { status: 503, headers },
  );
}

export async function GET() {
  const viewer = await currentViewer();
  if (!isAdministrator(viewer)) {
    return NextResponse.json(
      { success: false, code: 'FORBIDDEN', message: 'Administrator required' },
      { status: 403, headers },
    );
  }
  return editorialHold();
}

export async function POST(req: Request) {
  const configuredSecret = process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET;
  const presented = req.headers.get('x-cron-secret')
    || req.headers.get('x-internal-secret')
    || req.headers.get('authorization')?.replace(/^Bearer /, '');
  // Never allow a hard-coded default secret. An authenticated scheduler still
  // has no approval receipt and must not trigger unreviewed publication.
  if (configuredSecret && presented && presented === configuredSecret) return editorialHold();

  const viewer = await currentViewer();
  if (!isAdministrator(viewer)) {
    return NextResponse.json(
      { success: false, code: 'BLOG_PUBLISH_FORBIDDEN', message: 'Administrator required' },
      { status: 403, headers },
    );
  }
  return editorialHold();
}
