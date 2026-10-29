import { NextResponse } from 'next/server';
import { currentViewer, isAdministrator } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

const headers = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
} as const;

function authorizedScheduler(req: Request): boolean {
  const configuredSecret = process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET;
  const presented = req.headers.get('x-cron-secret')
    || req.headers.get('x-internal-secret')
    || req.headers.get('authorization')?.replace(/^Bearer /, '');
  return Boolean(configuredSecret && presented && presented === configuredSecret);
}

export async function GET(_req: Request) {
  if (!isAdministrator(await currentViewer())) {
    return NextResponse.json(
      { success: false, code: 'FORBIDDEN', message: 'Administrator required' },
      { status: 403, headers },
    );
  }
  // This endpoint describes only the retired file writer; real publisher health
  // is reported by the authenticated backend publisher-status BFF.
  return NextResponse.json({
    success: true,
    status: 'LEGACY_FILE_PUBLISHER_RETIRED',
    publicationEnabled: false,
    verifiedBackendPublisher: 'blog.rotation_2h',
    supportedCountries: ['KR', 'US', 'JP', 'CN'],
  }, { status: 200, headers });
}

export async function POST(req: Request) {
  if (!authorizedScheduler(req) && !isAdministrator(await currentViewer())) {
    return NextResponse.json(
      { success: false, code: 'BLOG_PUBLISH_FORBIDDEN', message: 'Administrator or valid scheduler secret required' },
      { status: 403, headers },
    );
  }
  // Do not synthesize review receipts or persist unverified financial articles.
  // The verified PostgreSQL-backed publisher is the sole publication authority.
  return NextResponse.json({
    success: false,
    code: 'LEGACY_UNVERIFIED_PUBLISHER_RETIRED',
    message: 'Legacy file publishing is disabled. Use the verified backend publication pipeline.',
    verifiedBackendPublisher: 'blog.rotation_2h',
  }, { status: 503, headers });
}
