import { NextResponse } from 'next/server';
import { currentViewer, isAdministrator } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'no-store' } as const;

/**
 * Legacy file-backed authoring has no independently verified primary-source,
 * country-native language, replay receipt or editor audit. It must never write
 * directly to /srv/moneyverse-data/shared/blog-posts.json, even with a valid
 * scheduler secret or an administrator session.
 *
 * The v1412 leader-elected backend job owns publication through the restricted
 * blog_publish_verified() database function instead. This endpoint is retained
 * as a fail-closed compatibility response for the old 04:00 cron. It does not
 * turn off the verified two-hour backend writer.
 */
export async function GET(_req: Request) {
  const viewer = await currentViewer();
  if (!isAdministrator(viewer)) {
    return NextResponse.json(
      { success: false, code: 'FORBIDDEN', message: 'Administrator required' },
      { status: 403, headers },
    );
  }
  return NextResponse.json({
    success: true,
    status: 'LEGACY_FILE_PUBLISHER_RETIRED',
    publicationEnabled: false,
    verifiedBackendPublisher: 'blog.rotation_2h',
    supportedCountries: ['KR', 'US', 'JP', 'CN'],
    supportedTopics: ['ECONOMY', 'CODING', 'COMPUTER'],
    message: 'Unverified JSON publication is retired. The verified DB scheduler is a separate service.',
  }, { status: 200, headers });
}

export async function POST(req: Request) {
  const configuredSecret = process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET;
  const presented = req.headers.get('x-cron-secret')
    || req.headers.get('x-internal-secret')
    || req.headers.get('authorization')?.replace(/^Bearer /, '');

  let authorized = Boolean(configuredSecret && presented && presented === configuredSecret);
  if (!authorized) authorized = isAdministrator(await currentViewer());
  if (!authorized) {
    return NextResponse.json(
      { success: false, code: 'BLOG_PUBLISH_FORBIDDEN', message: 'Administrator or valid scheduler secret required' },
      { status: 403, headers },
    );
  }
  return NextResponse.json(
    {
      success: false,
      code: 'LEGACY_UNVERIFIED_PUBLISHER_RETIRED',
      message: 'Verified backend scheduler and DB receipts are required for automatic publication.',
      verifiedBackendPublisher: 'blog.rotation_2h',
    },
    { status: 503, headers },
  );
}
