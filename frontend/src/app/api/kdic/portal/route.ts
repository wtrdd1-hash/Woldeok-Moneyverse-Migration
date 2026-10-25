import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { parseKdicPortal } from '@/app/kdic/kdic-contract';

export const dynamic = 'force-dynamic';
const headers = { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } as const;

/** Public same-origin read gateway. No fake fallback and no financial mutations. */
export async function GET(): Promise<NextResponse> {
  let upstream: unknown;
  try {
    upstream = await api<unknown>('/api/v1/kdic/portal', { method: 'GET' });
  } catch {
    return NextResponse.json({ success: false, code: 'KDIC_UNAVAILABLE' }, { status: 503, headers });
  }
  const data = parseKdicPortal(upstream);
  if (!data) {
    return NextResponse.json({ success: false, code: 'KDIC_INVALID_SNAPSHOT' }, { status: 502, headers });
  }
  return NextResponse.json({ success: true, data }, { headers });
}
