import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { parseLeagueSource } from '@/app/stocks/league/league-source';

export const dynamic = 'force-dynamic';

const privateHeaders = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};

export async function GET(): Promise<NextResponse> {
  try {
    // The upstream may include member-specific subscriptions when authenticated.
    const result = await api<unknown>('/api/v1/stocks/league/current', { method: 'GET' });
    if (parseLeagueSource(result) === null) {
      return NextResponse.json({ error: 'League source is unavailable.' }, { status: 503, headers: privateHeaders });
    }
    return NextResponse.json(result, { headers: privateHeaders });
  } catch {
    return NextResponse.json({ error: 'League source is unavailable.' }, { status: 503, headers: privateHeaders });
  }
}
