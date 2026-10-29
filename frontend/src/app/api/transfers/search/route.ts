import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Legacy nickname enumeration conflicts with the exact-UUID-only wallet policy.
// Keep a terminal response for old clients; never proxy a member-profile query.
export async function GET(_req: Request): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Recipient name search is retired. Ask the recipient for their exact Moneyverse UUID.' },
    { status: 410, headers: { 'Cache-Control': 'private, no-store' } },
  );
}
