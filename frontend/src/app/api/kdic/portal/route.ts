import { NextResponse } from 'next/server';
import { publicApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'cache-control': 'public, no-store' };

/** Same-origin BFF: never expose INTERNAL_API_TOKEN to the browser. */
export async function GET(): Promise<NextResponse> {
  const upstream = await publicApi<{ success: boolean; data?: unknown }>('/api/v1/kdic/portal', 0);
  if (!upstream?.success || !upstream.data) {
    return NextResponse.json(
      { success: false, error: 'KDIC public data unavailable' },
      { status: 503, headers: NO_STORE },
    );
  }
  return NextResponse.json({ success: true, data: upstream.data }, { headers: NO_STORE });
}
