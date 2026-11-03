import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';
import { parseMintStatusEvidence } from '@/components/admin/mint-status-evidence';

export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };

export async function GET() {
  try {
    const evidence = parseMintStatusEvidence(
      await api<unknown>('/api/v1/admin/economy/monetary/telemetry'),
    );
    if (!evidence) return NextResponse.json(
      { source: 'unavailable', code: 'MINT_POLICY_SOURCE_UNAVAILABLE' },
      { status: 503, headers },
    );
    return NextResponse.json({ source: 'persistent_monetary_policy', ...evidence }, { headers });
  } catch (e) {
    const denied = e instanceof ApiError && (e.status === 401 || e.status === 403);
    return NextResponse.json({
      source: 'unavailable',
      code: denied ? (e.status === 401 ? 'AUTHENTICATION_REQUIRED' : 'AUTHORIZATION_DENIED') : 'MINT_POLICY_SOURCE_UNAVAILABLE',
    }, { status: denied ? e.status : 503, headers });
  }
}
