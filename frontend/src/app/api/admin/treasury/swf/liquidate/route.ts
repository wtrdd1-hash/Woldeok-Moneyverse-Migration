import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Liquidation now requires an elevated console and a server-only CSRF token.
export async function POST(_request: Request) {
  return NextResponse.json(
    { error: 'This endpoint has been retired. Use the administrator console.' },
    { status: 410, headers: { 'Cache-Control': 'private, no-store' } },
  );
}
