import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';
import { parseVerifiedStockAlertSnapshot } from '@/lib/stock-alert-browser-events';

export const dynamic = 'force-dynamic';
const headers = { 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex, nofollow' };

export async function GET(): Promise<NextResponse> {
  const viewer = await viewerOrUnknown().catch(() => null);
  if (!viewer) return NextResponse.json({ error: 'Authentication unavailable' }, { status: 503, headers });
  if (!viewer.signedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });

  try {
    const [rules, recent] = await Promise.all([
      api<unknown>('/api/v1/stocks/alerts'),
      api<unknown>('/api/v1/stocks/alerts/events?limit=10'),
    ]);
    const alerts = rules && typeof rules === 'object' && 'alerts' in rules ? rules.alerts : null;
    const events = recent && typeof recent === 'object' && 'events' in recent ? recent.events : null;
    const snapshot = parseVerifiedStockAlertSnapshot({ alerts, events });
    if (!snapshot) throw new Error('Invalid server stock alert receipts');
    return NextResponse.json(snapshot, { headers });
  } catch {
    return NextResponse.json({ error: 'Verified stock alerts unavailable' }, { status: 503, headers });
  }
}
