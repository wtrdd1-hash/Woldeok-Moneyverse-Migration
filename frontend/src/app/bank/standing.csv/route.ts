import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';
import { bankStandingSnapshotCsv } from '../bank-standing-snapshot-csv';

export const dynamic = 'force-dynamic';

const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Content-Type-Options': 'nosniff',
};

export async function GET(): Promise<Response> {
  const viewer = await viewerOrUnknown().catch(() => null);
  if (!viewer)
    return NextResponse.json(
      { error: 'Authentication unavailable' },
      { status: 503, headers: PRIVATE_HEADERS },
    );
  if (!viewer.signedIn)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: PRIVATE_HEADERS });

  try {
    const data = await api<unknown>('/api/v1/banking/standing/snapshot');
    const csv = bankStandingSnapshotCsv(data);
    return new Response(csv, {
      status: 200,
      headers: {
        ...PRIVATE_HEADERS,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition':
          'attachment; filename="moneyverse-virtual-bank-current-snapshot.csv"',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Verified virtual bank snapshot unavailable' },
      { status: 503, headers: PRIVATE_HEADERS },
    );
  }
}
