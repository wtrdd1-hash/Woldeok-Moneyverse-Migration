import { NextResponse } from 'next/server';

// The old browser proxy could not establish the elevated console session.
// Admin bond reads and mutations now run through session-bound server actions.
export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint has been retired; use the administrator console action.' },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  );
}
