import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };

export async function GET(): Promise<NextResponse> {
  const viewer = await viewerOrUnknown();
  if (!viewer) return NextResponse.json({ error: 'Authentication unavailable' }, { status: 503, headers });
  if (!viewer.signedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  try {
    const result = await api<{ success: boolean; diagnosis?: unknown }>('/api/v1/advisor/deoki/diagnose');
    if (!result.success || !result.diagnosis) throw new Error('Unverified diagnosis');
    return NextResponse.json(result, { headers });
  } catch {
    return NextResponse.json({ error: 'Verified portfolio diagnosis is currently unavailable' }, { status: 503, headers });
  }
}
