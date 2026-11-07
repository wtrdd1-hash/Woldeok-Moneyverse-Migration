import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { parseAdvisorDiagnosis } from '@/lib/advisor-diagnosis';

export const dynamic = 'force-dynamic';
const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};

export async function GET(): Promise<NextResponse> {
  try {
    const result = await api<{ success?: boolean; diagnosis?: unknown }>('/api/v1/advisor/deoki/diagnose');
    const diagnosis = result?.success === true ? parseAdvisorDiagnosis(result.diagnosis) : null;
    if (!diagnosis) {
      return NextResponse.json({ sourceStatus: 'UNVERIFIED', error: 'advisor_source_unverified' },
        { status: 503, headers: PRIVATE_HEADERS });
    }
    // No invented Sharpe ratio, forecast, live trade or actor identifier is forwarded.
    return NextResponse.json({ sourceStatus: 'VERIFIED', diagnosis }, { headers: PRIVATE_HEADERS });
  } catch (error: unknown) {
    const status = typeof error === 'object' && error !== null && 'status' in error &&
      [401, 403, 428, 429].includes(Number(error.status)) ? Number(error.status) : 503;
    return NextResponse.json({ sourceStatus: 'UNVERIFIED', error: 'advisor_source_unavailable' },
      { status, headers: PRIVATE_HEADERS });
  }
}
